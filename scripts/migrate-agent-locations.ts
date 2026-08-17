import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const envLocalPath = resolve(__dirname, "../.env.local");
config({ path: existsSync(envLocalPath) ? envLocalPath : resolve(__dirname, "../.env") });

// One-time backfill: agents created before the multi-location feature only
// have a single flat country/state/city/address/pincode/services on the
// document. Copies that into locations[0] so they keep showing up in the
// new locations-array-based public search. Safe to re-run — skips any agent
// that already has a locations entry.
async function main() {
  const { connectToDatabase } = await import("../lib/mongodb");
  const { Agent } = await import("../models/Agent");

  await connectToDatabase();

  const totalBefore = await Agent.countDocuments({ "locations.0": { $exists: true } });
  console.log(`Agents with a locations entry before migration: ${totalBefore}`);

  const candidates = await Agent.find({
    "locations.0": { $exists: false },
    country: { $ne: "" },
  });

  console.log(`Found ${candidates.length} agent(s) to migrate.`);

  let migrated = 0;
  for (const agent of candidates) {
    agent.locations.push({
      country: agent.country,
      state: agent.state,
      city: agent.city,
      address: agent.address,
      pincode: agent.pincode,
      services: agent.services ?? [],
    });
    await agent.save();
    migrated += 1;
  }

  const totalAfter = await Agent.countDocuments({ "locations.0": { $exists: true } });
  console.log(`Migrated ${migrated} agent(s). Agents with a locations entry after migration: ${totalAfter}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to migrate agent locations:", error);
  process.exit(1);
});
