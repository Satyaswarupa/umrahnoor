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
