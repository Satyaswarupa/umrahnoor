import { Schema } from "mongoose";
import { registerModel } from "@/lib/model-registry";

export const OTP_PURPOSES = ["SIGNUP", "LOGIN"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

// Staged account data for a SIGNUP otp — the User (and, for an agent
// signup, the Agent profile) is only actually created once the code is
// verified, so nothing lands in the real collections until the mobile
// number is confirmed to be reachable.
const PendingSignupSchema = new Schema(
  {
    name: { type: String, required: true },
    // Only set for admin/agent signups — lets that account also log in with
    // email+password later, alongside mobile OTP.
    email: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], required: true },
  },
  { _id: false }
);

const OtpSchema = new Schema(
  {
    mobileNumber: { type: String, required: true, index: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    pendingSignup: { type: PendingSignupSchema, default: null },
  },
  { timestamps: true }
);

// TTL index — Mongo drops the document once expiresAt is in the past, so an
// abandoned (never verified) OTP cleans itself up without a cron job.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ mobileNumber: 1, purpose: 1 });

export const Otp = registerModel("Otp", OtpSchema);
