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

type Params = Promise<{ locationId: string }>;

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { locationId } = await params;

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

    const location = agent.locations.id(locationId);
    if (!location) return notFoundResponse("Location not found");

    Object.assign(location, parsed.data);
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("agent locations PUT error", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { locationId } = await params;

    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "ADMIN") return forbiddenResponse();

    await connectToDatabase();

    const agent = await Agent.findOne({ userId: session.userId });
    if (!agent) return notFoundResponse("Agent profile not found");

    const location = agent.locations.id(locationId);
    if (!location) return notFoundResponse("Location not found");

    location.deleteOne();
    await agent.save();

    return NextResponse.json({ agent: toPrivateAgent(agent) });
  } catch (error) {
    console.error("agent locations DELETE error", error);
    return serverErrorResponse();
  }
}
