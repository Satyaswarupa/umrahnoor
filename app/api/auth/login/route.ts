import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User, type UserRole } from "@/models/User";
import { verifyPassword, createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { errorResponse, validationErrorResponse, serverErrorResponse } from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const portalSchema = z.enum(["user", "admin"]);

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`login:${getClientIp(request)}`, 15, 60_000)) {
      return errorResponse("Too many login attempts. Please try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const portalParsed = portalSchema.safeParse(body.portal);
    const portal = portalParsed.success ? portalParsed.data : "user";

    const { email, password } = parsed.data;

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const role = user.role as UserRole;

    if (portal === "user" && role !== "USER") {
      return errorResponse(
        "This is an agent/admin account. Please use the agent login page.",
        403
      );
    }

    if (portal === "admin" && role === "USER") {
      return errorResponse(
        "This account is not an agent or admin account. Please use the customer login page.",
        403
      );
    }

    await createSessionCookie({ userId: String(user._id), role });

    return NextResponse.json({ role });
  } catch (error) {
    console.error("login error", error);
    return serverErrorResponse();
  }
}
