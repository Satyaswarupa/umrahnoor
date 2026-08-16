import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent, VERIFICATION_STATUSES } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { toPrivateAgent } from "@/lib/serializers";
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status && VERIFICATION_STATUSES.includes(status as (typeof VERIFICATION_STATUSES)[number])) {
      query.verificationStatus = status;
    }

    await connectToDatabase();

    const agents = await Agent.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ agents: agents.map(toPrivateAgent) });
  } catch (error) {
    console.error("superadmin agents list error", error);
    return serverErrorResponse();
  }
}
