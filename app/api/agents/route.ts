import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentSummary } from "@/lib/serializers";
import { serverErrorResponse } from "@/lib/api-response";
import { CITY_COORDINATES, distanceKm } from "@/lib/city-coordinates";

type AgentLocation = {
  country?: string;
  state?: string;
  city?: string;
  services?: string[];
};

type AgentLean = {
  businessType?: string;
  verificationBadge?: string;
  locations?: AgentLocation[];
};

// GOLD-badge agents rank ahead of everyone else, wherever they appear in a
// results list — Array#sort is stable, so this only reorders across badge
// tiers and leaves each tier's existing order (recency, distance) untouched.
function badgeWeight(badge: string | undefined): number {
  return badge === "GOLD" ? 0 : 1;
}

// How far outside the named city an agent (GOLD or not) is still allowed to
// surface as "nearby" — beyond this it's not a useful result even if it's
// the closest one on record.
const NEARBY_RADIUS_KM = 200;

// The service/business-type filter chips on the homepage are meant to be an
// exclusive "this is what this agent does" match against their single
// businessType field — not a fuzzy "offers this among other things" check.
// (Older per-location multi-select services still exist and are shown as
// tags on the card, but they don't drive this filter.)
function offersService(agent: AgentLean, service?: string): boolean {
  if (!service) return true;
  return agent.businessType === service;
}

function matchingLocationsFor(
  agent: AgentLean,
  filter: { country?: string; state?: string; city?: string },
): AgentLocation[] {
  return (agent.locations ?? []).filter(
    (location) =>
      (!filter.country || location.country === filter.country) &&
      (!filter.state || location.state === filter.state) &&
      (!filter.city || location.city === filter.city),
  );
}

// Verified/listed agents change infrequently — cache each distinct search
// (by query string) for a minute instead of hitting the DB on every request.
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country")?.trim();
    const state = searchParams.get("state")?.trim();
    const city = searchParams.get("city")?.trim();
    const service = searchParams.get("service")?.trim();
    const lat = Number.parseFloat(searchParams.get("lat") ?? "");
    const lng = Number.parseFloat(searchParams.get("lng") ?? "");
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    await connectToDatabase();

    // No city named — nothing to rank against exact-vs-nearby, just badge order.
    if (!city) {
      const locationMatch: Record<string, unknown> = {};
      if (country) locationMatch.country = country;
      if (state) locationMatch.state = state;

      const query: Record<string, unknown> = { verificationStatus: "VERIFIED", isListed: true };
      if (Object.keys(locationMatch).length > 0) {
        query.locations = { $elemMatch: locationMatch };
      }

      const found = await Agent.find(query).sort({ createdAt: -1 }).limit(200).lean();
      const filtered = found.filter((agent) => offersService(agent, service));
      const sorted = filtered
        .sort((a, b) => badgeWeight(a.verificationBadge) - badgeWeight(b.verificationBadge))
        .slice(0, 100);
      return NextResponse.json({
        agents: sorted.map((agent) => toPublicAgentSummary(agent, { country, state, city })),
      });
    }

    // A city was named. Without coordinates we can't judge "nearby", so keep
    // it simple: exact-city agents only, GOLD first among them.
    if (!hasCoords) {
      const locationMatch: Record<string, unknown> = { city };
      if (country) locationMatch.country = country;
      if (state) locationMatch.state = state;

      const found = await Agent.find({
        verificationStatus: "VERIFIED",
        isListed: true,
        locations: { $elemMatch: locationMatch },
      })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

      const filtered = found.filter((agent) => offersService(agent, service));
      const sorted = filtered
        .sort((a, b) => badgeWeight(a.verificationBadge) - badgeWeight(b.verificationBadge))
        .slice(0, 100);
      return NextResponse.json({
        agents: sorted.map((agent) => toPublicAgentSummary(agent, { country, state, city })),
      });
    }

    // City + coordinates: rank the whole state (not just the named city) so a
    // GOLD agent nearby always outranks a plain-verified agent in the exact
    // city — falling back to distance, then exact-city match, when nobody's
    // GOLD. Agents in the named city always show even without distance data.
    const stateMatch: Record<string, unknown> = {};
    if (country) stateMatch.country = country;
    if (state) stateMatch.state = state;

    const stateQuery: Record<string, unknown> = { verificationStatus: "VERIFIED", isListed: true };
    if (Object.keys(stateMatch).length > 0) {
      stateQuery.locations = { $elemMatch: stateMatch };
    }

    const candidates = await Agent.find(stateQuery).sort({ createdAt: -1 }).limit(300).lean();
    const userPoint = { lat, lng };

    const ranked = candidates
      .map((agent) => {
        if (!offersService(agent, service)) return null;

        const matchingLocations = matchingLocationsFor(agent, { country, state });

        // Named-city match is decided by string equality against whatever
        // the visitor's device resolved their city to — that string can
        // legitimately differ from an agent's registered city (geocoder
        // quirks, unlisted towns falling back to a raw name, etc.). Real
        // distance is computed independently below and is what actually
        // decides ranking, so a shaky cityMatch never lets a farther agent
        // steal a "same city" placement it didn't earn.
        const cityMatch = matchingLocations.some((location) => location.city === city);

        let nearestCity = "";
        let nearestDistanceKm = Infinity;
        for (const location of matchingLocations) {
          const coords = location.city ? CITY_COORDINATES[location.city] : undefined;
          if (!coords) continue;
          const distance = distanceKm(userPoint, coords);
          if (distance < nearestDistanceKm) {
            nearestDistanceKm = distance;
            nearestCity = location.city ?? "";
          }
        }

        return { agent, cityMatch, nearestCity, nearestDistanceKm };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      // Keep every exact-city agent regardless of distance data; only keep
      // elsewhere-in-state agents we can place within the nearby radius.
      .filter((entry) => entry.cityMatch || entry.nearestDistanceKm <= NEARBY_RADIUS_KM)
      // Badge tier first, then purely real distance — an exact city-name
      // match carries no extra weight of its own, so the actually-nearest
      // GOLD agent always wins regardless of how their city string compares.
      .sort(
        (a, b) =>
          badgeWeight(a.agent.verificationBadge) - badgeWeight(b.agent.verificationBadge) ||
          a.nearestDistanceKm - b.nearestDistanceKm,
      )
      .slice(0, 100);

    return NextResponse.json({
      agents: ranked.map((entry) => {
        const summary = toPublicAgentSummary(entry.agent, {
          country,
          state,
          city: entry.cityMatch ? city : entry.nearestCity,
        });
        return entry.cityMatch ? summary : { ...summary, distanceKm: Math.round(entry.nearestDistanceKm) };
      }),
      // "No verified agents in <city> — showing nearest agents" only makes
      // sense when nobody actually matched the named city.
      nearbyFallback: ranked.length > 0 && !ranked.some((entry) => entry.cityMatch),
    });
  } catch (error) {
    console.error("public agents list error", error);
    return serverErrorResponse();
  }
}
