export const COUNTRIES = ["India"] as const;

export const INDIA_STATES_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Durg"],
  Goa: ["Panaji", "Margao", "Vasco da Gama"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kannur", "Malappuram", "Kollam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
  Manipur: ["Imphal"],
  Meghalaya: ["Shillong"],
  Mizoram: ["Aizawl"],
  Nagaland: ["Kohima", "Dimapur"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur", "Berhampur", "Jajpur"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Sikkim: ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Tripura: ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Noida", "Prayagraj"],
  Uttarakhand: ["Dehradun", "Haridwar", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa"],
  Delhi: ["New Delhi", "Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti"],
  Puducherry: ["Puducherry"],
};

export const INDIA_STATES = Object.keys(INDIA_STATES_CITIES).sort();

export function getCitiesForState(state: string): string[] {
  return INDIA_STATES_CITIES[state] ?? [];
}

export type LocationSuggestion = { state: string; city: string; label: string };

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// Free-text search over the known state/city list, e.g. typing "jaipur" or
// "odisha" — used for the location search bar's autocomplete.
export function searchLocations(query: string, limit = 6): LocationSuggestion[] {
  const trimmed = normalize(query);
  if (!trimmed) return [];

  const results: LocationSuggestion[] = [];

  for (const state of INDIA_STATES) {
    if (normalize(state).includes(trimmed)) {
      results.push({ state, city: "", label: state });
    }
    for (const city of getCitiesForState(state)) {
      if (normalize(city).includes(trimmed)) {
        results.push({ state, city, label: `${city}, ${state}` });
      }
    }
  }

  results.sort((a, b) => {
    const aStarts = normalize(a.label).startsWith(trimmed) ? 0 : 1;
    const bStarts = normalize(b.label).startsWith(trimmed) ? 0 : 1;
    return aStarts - bStarts;
  });

  return results.slice(0, limit);
}

// Best-effort single match for when the user submits the search bar directly
// instead of picking a suggestion.
export function resolveLocationQuery(query: string): { state: string; city: string } | null {
  const [best] = searchLocations(query, 1);
  return best ? { state: best.state, city: best.city } : null;
}
