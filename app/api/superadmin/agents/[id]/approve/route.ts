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

    // A Government ID Document alone is enough to approve. The GST document +
    // verified certificate pair is a legacy alternate path; every other
    // document (trade license, GST certificate, etc.) is optional and never
    // blocks approval.
    const hasGovId = Boolean(agent.govIdDocument);
    const hasLegacyDocuments = Boolean(agent.gstDocument && agent.certificateDocument);

    if (!hasGovId && !hasLegacyDocuments) {
      return errorResponse(
        "Cannot approve: agent has not uploaded a Government ID Document yet.",
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
