import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { toPrivateAgent } from "@/lib/serializers";
import { updateAgentBadgeSchema } from "@/lib/validation";
import {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
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

    const agent = await Agent.findById(id).lean();
    if (!agent) return notFoundResponse("Agent not found");

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("superadmin agent detail error", error);
    return serverErrorResponse();
  }
}

// Lets a superadmin correct a verified agent's badge after the fact (e.g. the
// wrong one was picked at approval time) without having to re-approve them.
export async function PATCH(
  request: Request,
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

    const parsed = updateAgentBadgeSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();

    const agent = await Agent.findById(id);
    if (!agent) return notFoundResponse("Agent not found");
    if (agent.verificationStatus !== "VERIFIED") {
      return errorResponse("Only verified agents have a badge to change.", 400);
    }

    agent.verificationBadge = parsed.data.verificationBadge;
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("superadmin update agent badge error", error);
    return serverErrorResponse();
  }
}
