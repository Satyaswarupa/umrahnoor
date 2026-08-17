import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { isAllowedDocumentFile, uploadDocumentToCloudinary } from "@/lib/cloudinary";
import {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

const DOCUMENT_TYPES = [
  "gst",
  "certificate",
  "additional",
  "govId",
  "tradeLicense",
  "gstCertificate",
  "profile",
] as const;
const MAX_ADDITIONAL_DOCUMENTS = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "ADMIN") return forbiddenResponse();

    const formData = await request.formData().catch(() => null);
    if (!formData) return errorResponse("Invalid form data", 400);

    const type = formData.get("type");
    const file = formData.get("file");
    const label = formData.get("name");

    if (typeof type !== "string" || !DOCUMENT_TYPES.includes(type as (typeof DOCUMENT_TYPES)[number])) {
      return errorResponse("Invalid document type", 400);
    }

    if (!(file instanceof File)) {
      return errorResponse("No file uploaded", 400);
    }

    const validity = isAllowedDocumentFile(file);
    if (!validity.ok) {
      return errorResponse(validity.reason, 400);
    }

    await connectToDatabase();

    const agent = await Agent.findOne({ userId: session.userId });
    if (!agent) return notFoundResponse("Agent profile not found");

    if (type === "additional" && agent.additionalDocuments.length >= MAX_ADDITIONAL_DOCUMENTS) {
      return errorResponse(`You can upload a maximum of ${MAX_ADDITIONAL_DOCUMENTS} additional documents`, 400);
    }

    const uploaded = await uploadDocumentToCloudinary(file, `umrahnoor/agents/${agent._id}`);

    if (type === "gst") {
      agent.gstDocument = uploaded;
    } else if (type === "certificate") {
      agent.certificateDocument = uploaded;
    } else if (type === "govId") {
      agent.govIdDocument = uploaded;
    } else if (type === "tradeLicense") {
      agent.tradeLicenseDocument = uploaded;
    } else if (type === "gstCertificate") {
      agent.gstCertificateDocument = uploaded;
    } else if (type === "profile") {
      agent.profileImage = uploaded;
    } else {
      agent.additionalDocuments.push({
        ...uploaded,
        name: typeof label === "string" && label.trim() ? label.trim() : file.name,
      });
    }

    await agent.save();

    return NextResponse.json({ document: uploaded });
  } catch (error) {
    console.error("agent upload error", error);
    return serverErrorResponse();
  }
}
