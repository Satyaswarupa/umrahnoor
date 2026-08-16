import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, createSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { toSafeUser } from "@/lib/serializers";
import {
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`signup:${getClientIp(request)}`, 10, 60_000)) {
      return errorResponse("Too many requests. Please try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { name, email, password } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "USER",
    });

    await createSessionCookie({ userId: String(user._id), role: "USER" });

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("signup error", error);
    return serverErrorResponse();
  }
}
