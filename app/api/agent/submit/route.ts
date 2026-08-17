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

    // Two independent verification paths, so both the website's original
    // company/GST-document flow and the app's newer business/government-ID
    // flow can each submit on their own without needing the other's fields.
    const missing: string[] = [];
    if (!agent.companyName) missing.push("company name");

    const hasLegacyVerification = Boolean(
      agent.mobileNumber &&
        agent.whatsappNumber &&
        agent.country &&
        agent.state &&
        agent.city &&
        agent.address &&
        agent.gstNumber &&
        agent.gstDocument &&
        agent.certificateDocument
    );
    const hasBusinessVerification = Boolean(
      agent.businessType &&
        agent.businessEmail &&
        agent.businessPhone &&
        agent.govIdType &&
        agent.govIdNumber &&
        agent.govIdDocument
    );

    if (!hasLegacyVerification && !hasBusinessVerification) {
      missing.push(
        "your mobile/WhatsApp number, location, address, GST number, GST document, and verified certificate, or your business type, business email, business phone, government ID type/number, and government ID document"
      );
    }

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
