import LocationSearchForm from "@/components/LocationSearchForm";
import AgentCard from "@/components/AgentCard";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentSummary } from "@/lib/serializers";

type SearchParams = Promise<{ country?: string; state?: string; city?: string }>;

export const metadata = {
  title: "Find Umrah Agents | UmrahNoor",
};

async function getAgents(filters: { country?: string; state?: string; city?: string }) {
  await connectToDatabase();

  const query: Record<string, unknown> = {
    verificationStatus: "VERIFIED",
    isListed: true,
  };
  if (filters.country) query.country = filters.country;
  if (filters.state) query.state = filters.state;
  if (filters.city) query.city = filters.city;

  const agents = await Agent.find(query).sort({ createdAt: -1 }).limit(100).lean();
  return agents.map(toPublicAgentSummary);
}

export default async function AgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const { country, state, city } = await searchParams;
  const agents = await getAgents({ country, state, city });

  const locationLabel = [city, state, country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-emerald-950">Find Umrah Agents</h1>
      <p className="mt-2 text-emerald-900/70">
        Search verified Umrah travel agents by location and contact them directly.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/10">
        <LocationSearchForm
          variant="filter"
          initialCountry={country}
          initialState={state}
          initialCity={city}
        />
      </div>

      <div className="mt-8">
        {agents.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-emerald-900/60">
              {agents.length} verified agent{agents.length === 1 ? "" : "s"}
              {locationLabel ? ` found in ${locationLabel}` : ""}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-emerald-950">
              No verified Umrah agents were found for this location.
            </p>
            <p className="mt-2 text-sm text-emerald-900/60">
              Try selecting a different state or city, or search without a city filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
