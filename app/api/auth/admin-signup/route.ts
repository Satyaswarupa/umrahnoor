import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Agent } from "@/models/Agent";
import { hashPassword, createSessionCookie } from "@/lib/auth";
import { adminSignupSchema } from "@/lib/validation";
import { toSafeUser } from "@/lib/serializers";
import {
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`admin-signup:${getClientIp(request)}`, 10, 60_000)) {
      return errorResponse("Too many requests. Please try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = adminSignupSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const {
      companyName,
      ownerName,
      email,
      password,
      mobileNumber,
      whatsappNumber,
      country,
      state,
      city,
      address,
    } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: ownerName,
      email,
      passwordHash,
      role: "ADMIN",
    });

    await Agent.create({
      userId: user._id,
      companyName,
      ownerName,
      email,
      mobileNumber,
      whatsappNumber,
      country,
      state,
      city,
      address,
      verificationStatus: "INCOMPLETE",
      isListed: false,
    });

    await createSessionCookie({ userId: String(user._id), role: "ADMIN" });

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("admin-signup error", error);
    return serverErrorResponse();
  }
}
