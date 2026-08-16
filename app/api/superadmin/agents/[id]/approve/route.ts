import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { toPrivateAgent } from "@/lib/serializers";
import {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return notFoundResponse("Agent not found");

    await connectToDatabase();

    const agent = await Agent.findById(id);
    if (!agent) return notFoundResponse("Agent not found");

    if (!agent.gstDocument || !agent.certificateDocument) {
      return errorResponse(
        "Cannot approve: agent is missing required documents (GST document or verified certificate).",
        400
      );
    }

    agent.verificationStatus = "VERIFIED";
    agent.isListed = true;
    agent.rejectionReason = "";
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("superadmin approve error", error);
    return serverErrorResponse();
  }
}
