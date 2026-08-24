import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { User, type UserRole } from "@/models/User";
import { Otp } from "@/models/Otp";
import { hashPassword } from "@/lib/auth";
import { generateOtpCode, hashOtpCode, OTP_TTL_MS } from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";
import { otpSignupRequestSchema, otpLoginRequestSchema, mobileNumberSchema } from "@/lib/validation";
import { errorResponse, validationErrorResponse, serverErrorResponse } from "@/lib/api-response";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const purposeSchema = z.enum(["SIGNUP", "LOGIN"]);

type PendingSignup = {
  name: string;
  email: string;
  passwordHash: string;
  role: Extract<UserRole, "USER" | "ADMIN">;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    const purposeParsed = purposeSchema.safeParse(body.purpose);
    if (!purposeParsed.success) return errorResponse("Invalid request", 400);
    const purpose = purposeParsed.data;

    // OTP SMS delivery is a metered, paid third-party call — rate-limit hard
    // (per IP and per mobile number) so a mistake or abuse doesn't burn
    // through the account's quota.
    if (isRateLimited(`otp-send-ip:${getClientIp(request)}`, 8, 10 * 60_000)) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const mobileParsed = mobileNumberSchema.safeParse(body.mobileNumber);
    if (!mobileParsed.success) return validationErrorResponse(mobileParsed.error);
    const mobileNumber = mobileParsed.data;

    if (isRateLimited(`otp-send-mobile:${mobileNumber}`, 3, 10 * 60_000)) {
      return errorResponse(
        "Too many OTP requests for this number. Please try again in a few minutes.",
        429
      );
    }

    await connectToDatabase();

    let pendingSignup: PendingSignup | null = null;

    if (purpose === "SIGNUP") {
      const parsed = otpSignupRequestSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);

      const existing = await User.findOne({ mobileNumber }).lean();
      if (existing) {
        return errorResponse(
          "An account with this mobile number already exists. Please log in instead.",
          409
        );
      }

      const email = parsed.data.email || "";
      if (email) {
        const existingEmail = await User.findOne({ email }).lean();
        if (existingEmail) {
          return errorResponse(
            "An account with this email already exists. Please log in instead.",
            409
          );
        }
      }

      pendingSignup = {
        name: parsed.data.name,
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role: parsed.data.portal === "admin" ? "ADMIN" : "USER",
      };
    } else {
      const parsed = otpLoginRequestSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error);

      const user = await User.findOne({ mobileNumber });
      if (!user) {
        return errorResponse("No account found with this mobile number.", 404);
      }
      const role = user.role as UserRole;
      if (parsed.data.portal === "user" && role !== "USER") {
        return errorResponse(
          "This is an agent/admin account. Please use the agent login page.",
          403
        );
      }
      if (parsed.data.portal === "admin" && role === "USER") {
        return errorResponse(
          "This account is not an agent or admin account. Please use the customer login page.",
          403
        );
      }
    }

    const code = generateOtpCode();

    try {
      await sendOtpSms(mobileNumber, code);
    } catch (smsError) {
      console.error("otp sms send failed", smsError);
      return errorResponse("Failed to send the OTP. Please try again in a moment.", 502);
    }

    const codeHash = await hashOtpCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Replace any earlier pending code for this mobile+purpose instead of
    // stacking them — only the most recently sent code should ever verify.
    await Otp.findOneAndDelete({ mobileNumber, purpose });
    await Otp.create({ mobileNumber, purpose, codeHash, expiresAt, pendingSignup });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("otp send error", error);
    return serverErrorResponse();
  }
}
