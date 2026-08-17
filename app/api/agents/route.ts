import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentSummary } from "@/lib/serializers";
import { serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country")?.trim();
    const state = searchParams.get("state")?.trim();
    const city = searchParams.get("city")?.trim();
    const service = searchParams.get("service")?.trim();

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

    return NextResponse.json({
      agents: agents.map((agent) => toPublicAgentSummary(agent, { country, state, city })),
    });
  } catch (error) {
    console.error("public agents list error", error);
    return serverErrorResponse();
  }
}
