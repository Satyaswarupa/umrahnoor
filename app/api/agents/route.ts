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

// GOLD-badge agents rank ahead of everyone else, wherever they appear in a
// results list — Array#sort is stable, so this only reorders across badge
// tiers and leaves each tier's existing order (recency, distance) untouched.
function badgeWeight(badge: string | undefined): number {
  return badge === "GOLD" ? 0 : 1;
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

    const query: Record<string, unknown> = {
      verificationStatus: "VERIFIED",
      isListed: true,
    };

    const locationMatch: Record<string, unknown> = {};
    if (country) locationMatch.country = country;
    if (state) locationMatch.state = state;
    if (city) locationMatch.city = city;
    if (service) locationMatch.services = service;
    if (Object.keys(locationMatch).length > 0) {
      query.locations = { $elemMatch: locationMatch };
    }

    await connectToDatabase();

    const agents = await Agent.find(query).sort({ createdAt: -1 }).limit(100).lean();

    if (agents.length > 0) {
      const sorted = [...agents].sort(
        (a, b) => badgeWeight(a.verificationBadge) - badgeWeight(b.verificationBadge),
      );
      return NextResponse.json({
        agents: sorted.map((agent) => toPublicAgentSummary(agent, { country, state, city })),
      });
    }

    // No agent in the exact city — if we know the visitor's coordinates, fall
    // back to every agent elsewhere in the state and rank them by real
    // distance from those coordinates instead of returning nothing.
    if (!city || !hasCoords) {
      return NextResponse.json({ agents: [] });
    }

    const fallbackMatch: Record<string, unknown> = {};
    if (country) fallbackMatch.country = country;
    if (state) fallbackMatch.state = state;
    if (service) fallbackMatch.services = service;

    const fallbackQuery: Record<string, unknown> = {
      verificationStatus: "VERIFIED",
      isListed: true,
    };
    if (Object.keys(fallbackMatch).length > 0) {
      fallbackQuery.locations = { $elemMatch: fallbackMatch };
    }

    const candidates = await Agent.find(fallbackQuery).limit(200).lean();
    const userPoint = { lat, lng };

    const ranked = candidates
      .map((agent) => {
        const matchingLocations = ((agent.locations ?? []) as AgentLocation[]).filter(
          (location) =>
            (!country || location.country === country) &&
            (!state || location.state === state) &&
            (!service || (location.services ?? []).includes(service)),
        );

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

        return { agent, nearestCity, nearestDistanceKm };
      })
      .filter((entry) => Number.isFinite(entry.nearestDistanceKm))
      .sort(
        (a, b) =>
          badgeWeight(a.agent.verificationBadge) - badgeWeight(b.agent.verificationBadge) ||
          a.nearestDistanceKm - b.nearestDistanceKm,
      )
      .slice(0, 100);

    return NextResponse.json({
      agents: ranked.map((entry) => ({
        ...toPublicAgentSummary(entry.agent, { country, state, city: entry.nearestCity }),
        distanceKm: Math.round(entry.nearestDistanceKm),
      })),
      nearbyFallback: ranked.length > 0,
    });
  } catch (error) {
    console.error("public agents list error", error);
    return serverErrorResponse();
  }
}
