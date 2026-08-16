import { NextResponse } from "next/server";
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

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "ADMIN") return forbiddenResponse();

    await connectToDatabase();

    const agent = await Agent.findOne({ userId: session.userId });
    if (!agent) return notFoundResponse("Agent profile not found");

    if (agent.verificationStatus === "VERIFIED") {
      return errorResponse("Your company is already verified", 400);
    }

    const missing: string[] = [];
    if (!agent.companyName) missing.push("company name");
    if (!agent.mobileNumber) missing.push("mobile number");
    if (!agent.whatsappNumber) missing.push("WhatsApp number");
    if (!agent.country || !agent.state || !agent.city) missing.push("location");
    if (!agent.address) missing.push("business address");
    if (!agent.gstNumber) missing.push("GST number");
    if (!agent.gstDocument) missing.push("GST document");
    if (!agent.certificateDocument) missing.push("verified certificate document");

    if (missing.length > 0) {
      return errorResponse(
        `Please complete the following before submitting: ${missing.join(", ")}.`,
        400
      );
    }

    agent.verificationStatus = "PENDING";
    agent.isListed = false;
    agent.rejectionReason = "";
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("agent submit error", error);
    return serverErrorResponse();
  }
}
