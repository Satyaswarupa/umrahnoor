import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { SITE_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const agents = await Agent.find({ verificationStatus: "VERIFIED", isListed: true })
    .select("_id updatedAt")
    .lean();

  const agentEntries: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${SITE_URL}/agents/${agent._id}`,
    lastModified: agent.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/admin/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...agentEntries,
  ];
}
