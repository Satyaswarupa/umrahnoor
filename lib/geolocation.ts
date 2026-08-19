import { getCitiesForState, INDIA_STATES } from "@/lib/locations";

export type ResolvedLocation = {
  state: string;
  city: string;
  rawRegion?: string;
  rawCity?: string;
  latitude: number;
  longitude: number;
};

export type LocationErrorCode = "permission-denied" | "unavailable" | "no-match";

export class LocationError extends Error {
  code: LocationErrorCode;
  constructor(message: string, code: LocationErrorCode) {
    super(message);
    this.code = code;
  }
}

// Handles a few common alternate names a geocoder may return for a state.
const STATE_ALIASES: Record<string, string> = {
  orissa: "Odisha",
  "nct of delhi": "Delhi",
  "delhi ncr": "Delhi",
  pondicherry: "Puducherry",
  uttaranchal: "Uttarakhand",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchState(rawRegion: string | null | undefined): string {
  if (!rawRegion) return "";
  const normalized = normalize(rawRegion);
  if (STATE_ALIASES[normalized]) return STATE_ALIASES[normalized];
  return INDIA_STATES.find((state) => normalize(state) === normalized) ?? "";
}

function matchCity(state: string, rawCity: string | null | undefined): string {
  if (!state || !rawCity) return "";
  const normalized = normalize(rawCity);
  return getCitiesForState(state).find((city) => normalize(city) === normalized) ?? "";
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

// Agents are registered against an administrative state/city, not GPS
// coordinates, so "near me" means: locate the browser, reverse-geocode that
// to a state/city, then reuse the normal state/city search.
export async function resolveNearbyLocation(): Promise<ResolvedLocation> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new LocationError("Location is not available in this browser.", "unavailable");
  }

  let position: GeolocationPosition;
  try {
    position = await getCurrentPosition();
  } catch (err) {
    if (err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED) {
      throw new LocationError(
        "Location permission was denied. Enable it in your browser settings to find agents near you.",
        "permission-denied",
      );
    }
    throw new LocationError("Could not determine your location. Please try again.", "unavailable");
  }

  const { latitude, longitude } = position.coords;

  let response: Response;
  try {
    response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
  } catch {
    throw new LocationError("Could not determine your location. Please try again.", "unavailable");
  }
  if (!response.ok) {
    throw new LocationError("Could not determine your location. Please try again.", "unavailable");
  }

  const data = (await response.json()) as { principalSubdivision?: string; city?: string; locality?: string };
  const rawRegion = data.principalSubdivision;
  const rawCity = data.city || data.locality;

  const state = matchState(rawRegion);
  if (!state) {
    throw new LocationError(
      `We couldn't match your location${rawRegion ? ` (${rawRegion})` : ""} to a supported state.`,
      "no-match",
    );
  }

  // The curated city list only covers major cities (for the search bar's
  // autocomplete). The browser can resolve to a smaller town that isn't in
  // that list, so fall back to the geocoder's own city name instead of
  // dropping it — agents are matched against this string directly.
  const city = matchCity(state, rawCity) || (rawCity ? rawCity.trim() : "");
  return { state, city, rawRegion, rawCity, latitude, longitude };
}
