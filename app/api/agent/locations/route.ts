import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { locationSchema } from "@/lib/validation";
import { toPrivateAgent } from "@/lib/serializers";
import {
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

const MAX_LOCATIONS = 10;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "ADMIN") return forbiddenResponse();

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();

    const agent = await Agent.findOne({ userId: session.userId });
    if (!agent) return notFoundResponse("Agent profile not found");

    if (agent.locations.length >= MAX_LOCATIONS) {
      return errorResponse(`You can add a maximum of ${MAX_LOCATIONS} locations`, 400);
    }

    agent.locations.push(parsed.data);
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) }, { status: 201 });
  } catch (error) {
    console.error("agent locations POST error", error);
    return serverErrorResponse();
  }
}
