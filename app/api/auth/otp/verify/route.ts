import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User, type UserRole } from "@/models/User";
import { Agent } from "@/models/Agent";
import { Otp } from "@/models/Otp";
import { createSessionCookie } from "@/lib/auth";
import { verifyOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { toSafeUser } from "@/lib/serializers";
import { otpVerifySchema } from "@/lib/validation";
import { errorResponse, validationErrorResponse, serverErrorResponse } from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`otp-verify:${getClientIp(request)}`, 20, 10 * 60_000)) {
      return errorResponse("Too many attempts. Please try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const { mobileNumber, purpose, otp, portal } = parsed.data;

    await connectToDatabase();

    const record = await Otp.findOne({ mobileNumber, purpose });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      if (record) await record.deleteOne();
      return errorResponse("This code has expired. Please request a new one.", 400);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await record.deleteOne();
      return errorResponse("Too many incorrect attempts. Please request a new code.", 429);
    }

    const valid = await verifyOtpCode(otp, record.codeHash);
    if (!valid) {
      record.attempts += 1;
      await record.save();
      return errorResponse("Incorrect code. Please try again.", 400);
    }

    let user;

    if (purpose === "SIGNUP") {
      if (!record.pendingSignup) {
        await record.deleteOne();
        return serverErrorResponse();
      }

      // The number (or email) could have been claimed by another signup
      // between send and verify — re-check right before creating the
      // account, not just at send time.
      const existing = await User.findOne({ mobileNumber }).lean();
      if (existing) {
        await record.deleteOne();
        return errorResponse(
          "An account with this mobile number already exists. Please log in instead.",
          409
        );
      }

      const email = record.pendingSignup.email || undefined;
      if (email) {
        const existingEmail = await User.findOne({ email }).lean();
        if (existingEmail) {
          await record.deleteOne();
          return errorResponse(
            "An account with this email already exists. Please log in instead.",
            409
          );
        }
      }

      user = await User.create({
        name: record.pendingSignup.name,
        email,
        mobileNumber,
        passwordHash: record.pendingSignup.passwordHash,
        role: record.pendingSignup.role,
      });

      if (record.pendingSignup.role === "ADMIN") {
        await Agent.create({
          userId: user._id,
          companyName: "",
          ownerName: record.pendingSignup.name,
          email: email || "",
          mobileNumber,
          whatsappNumber: mobileNumber,
          verificationStatus: "INCOMPLETE",
          isListed: false,
        });
      }
    } else {
      user = await User.findOne({ mobileNumber });
      if (!user) {
        await record.deleteOne();
        return errorResponse("No account found with this mobile number.", 404);
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
    }

    await record.deleteOne();
    await createSessionCookie({ userId: String(user._id), role: user.role as UserRole });

    return NextResponse.json(
      { role: user.role, user: toSafeUser(user) },
      { status: purpose === "SIGNUP" ? 201 : 200 }
    );
  } catch (error) {
    console.error("otp verify error", error);
    return serverErrorResponse();
  }
}
