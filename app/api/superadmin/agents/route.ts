import crypto from "node:crypto";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent, VERIFICATION_STATUSES } from "@/models/Agent";
import { User } from "@/models/User";
import { getSession, hashPassword } from "@/lib/auth";
import { toPrivateAgent } from "@/lib/serializers";
import { superadminCreateAgentSchema } from "@/lib/validation";
import { isAllowedDocumentFile, uploadDocumentToCloudinary } from "@/lib/cloudinary";
import {
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

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

// A superadmin adding an agent directly (no signup flow, no document review)
// — the agent goes live immediately as VERIFIED + listed. Every Agent still
// needs a User account to satisfy the schema, so one is created here with a
// system-generated email/password the agent isn't given; that's a deliberate
// gap for now (this is a superadmin-curated listing, not agent self-service).
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    const formData = await request.formData().catch(() => null);
    if (!formData) return errorResponse("Invalid form data", 400);

    const parsed = superadminCreateAgentSchema.safeParse({
      companyName: formData.get("companyName"),
      businessType: formData.get("businessType"),
      mobileNumber: formData.get("mobileNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      country: formData.get("country"),
      state: formData.get("state"),
      city: formData.get("city"),
    });
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const file = formData.get("profileImage");
    if (file !== null && !(file instanceof File)) {
      return errorResponse("Invalid profile image", 400);
    }
    if (file instanceof File) {
      const validity = isAllowedDocumentFile(file);
      if (!validity.ok) return errorResponse(validity.reason, 400);
    }

    await connectToDatabase();

    const { companyName, businessType, mobileNumber, whatsappNumber, country, state, city } =
      parsed.data;

    const agentId = new mongoose.Types.ObjectId();
    const email = `agent-${agentId}@umrahnoor.internal`;
    const passwordHash = await hashPassword(crypto.randomBytes(24).toString("hex"));

    const user = await User.create({
      name: companyName,
      email,
      passwordHash,
      role: "ADMIN",
    });

    const profileImage =
      file instanceof File ? await uploadDocumentToCloudinary(file, `umrahnoor/agents/${agentId}`) : null;

    const agent = await Agent.create({
      _id: agentId,
      userId: user._id,
      companyName,
      ownerName: companyName,
      email,
      mobileNumber,
      whatsappNumber,
      businessType,
      services: [businessType],
      country,
      state,
      city,
      profileImage,
      locations: [{ country, state, city, address: "", pincode: "", services: [businessType] }],
      verificationStatus: "VERIFIED",
      isListed: true,
    });

    return NextResponse.json({ agent: toPrivateAgent(agent) }, { status: 201 });
  } catch (error) {
    console.error("superadmin create agent error", error);
    return serverErrorResponse();
  }
}
