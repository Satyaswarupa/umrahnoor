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

    const query: Record<string, unknown> = {
      verificationStatus: "VERIFIED",
      isListed: true,
    };
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    await connectToDatabase();

    const agents = await Agent.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      agents: agents.map(toPublicAgentSummary),
    });
  } catch (error) {
    console.error("public agents list error", error);
    return serverErrorResponse();
  }
}
