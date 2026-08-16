import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { toPublicAgentDetail } from "@/lib/serializers";
import { notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return notFoundResponse("Agent not found");
    }

    await connectToDatabase();

    const agent = await Agent.findOne({
      _id: id,
      verificationStatus: "VERIFIED",
      isListed: true,
    }).lean();

    if (!agent) return notFoundResponse("Agent not found");

    return NextResponse.json({ agent: toPublicAgentDetail(agent) });
  } catch (error) {
    console.error("public agent detail error", error);
    return serverErrorResponse();
  }
}
