import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { registerModel } from "@/lib/model-registry";

export const USER_ROLES = ["USER", "ADMIN", "SUPERADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    // Legacy identity field — still used by pre-OTP accounts (including the
    // superadmin) to log in with email+password. New OTP-based signups don't
    // collect it. Left without a unique index: the live collection already
    // has a non-sparse unique index on this field from before mobile-based
    // accounts existed, and changing it to sparse here wouldn't migrate that
    // existing index, so uniqueness for email is enforced at the
    // application layer (see app/api/auth/signup) instead.
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
    // Primary identity for OTP-based accounts — unique + sparse so any
    // number of legacy, email-only accounts (mobileNumber absent) can
    // coexist without colliding on the index.
    mobileNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "USER",
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User = registerModel("User", UserSchema);
