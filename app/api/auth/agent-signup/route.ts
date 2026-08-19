import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Agent } from "@/models/Agent";
import { getSession, hashPassword, createSessionCookie } from "@/lib/auth";
import { agentSignupSchema } from "@/lib/validation";
import { toSafeUser } from "@/lib/serializers";
import { errorResponse, validationErrorResponse, serverErrorResponse } from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`agent-signup:${getClientIp(request)}`, 10, 60_000)) {
      return errorResponse("Too many requests. Please try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = agentSignupSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { name, email, phone, password } = parsed.data;

    await connectToDatabase();

    const session = await getSession();
    // A session cookie can outlive the user it points to (e.g. the account
    // was removed directly in the database during testing) — treat that the
    // same as not being logged in and fall through to a fresh signup below,
    // rather than hard-failing with a confusing "session invalid" error.
    const existingUser = session ? await User.findById(session.userId) : null;

    if (existingUser) {
      // Already signed in — upgrade this account to an agent in place instead
      // of creating a second, conflicting account with the same email.
      const user = existingUser;

      if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        user.role = "ADMIN";
        await user.save();
        await createSessionCookie({ userId: String(user._id), role: "ADMIN" });
      }

      let agent = await Agent.findOne({ userId: user._id });
      if (!agent) {
        agent = await Agent.create({
          userId: user._id,
          companyName: "",
          ownerName: name,
          email: user.email,
          mobileNumber: phone,
          whatsappNumber: phone,
          verificationStatus: "INCOMPLETE",
          isListed: false,
        });
      }

      return NextResponse.json({ user: toSafeUser(user) }, { status: 200 });
    }

    if (!password) {
      return errorResponse("Password is required to create an account", 400);
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
    });

    await Agent.create({
      userId: user._id,
      companyName: "",
      ownerName: name,
      email,
      mobileNumber: phone,
      whatsappNumber: phone,
      verificationStatus: "INCOMPLETE",
      isListed: false,
    });

    await createSessionCookie({ userId: String(user._id), role: "ADMIN" });

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("agent-signup error", error);
    return serverErrorResponse();
  }
}
