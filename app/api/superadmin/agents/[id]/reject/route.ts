import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { rejectAgentSchema } from "@/lib/validation";
import { toPrivateAgent } from "@/lib/serializers";
import {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return notFoundResponse("Agent not found");

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = rejectAgentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();

    const agent = await Agent.findById(id);
    if (!agent) return notFoundResponse("Agent not found");

    agent.verificationStatus = "REJECTED";
    agent.isListed = false;
    agent.rejectionReason = parsed.data.rejectionReason;
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("superadmin reject error", error);
    return serverErrorResponse();
  }
}
