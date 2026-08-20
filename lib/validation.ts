import { z } from "zod";
import { SERVICE_SLUGS } from "@/lib/services";
import { VERIFICATION_BADGES } from "@/models/Agent";

const phoneRegex = /^\+?[0-9]{7,15}$/;
const gstRegex = /^[0-9A-Z]{15}$/;

export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
export const emailSchema = z.email("Enter a valid email address").trim().toLowerCase();
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");
export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRegex, "Enter a valid phone number (digits only, optionally starting with +)");
export const countrySchema = z.string().trim().min(2).max(100);
export const stateSchema = z.string().trim().min(2).max(100);
export const citySchema = z.string().trim().min(2).max(100);

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const adminSignupSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required").max(150),
    ownerName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    mobileNumber: phoneSchema,
    whatsappNumber: phoneSchema,
    country: countrySchema,
    state: stateSchema,
    city: citySchema,
    address: z.string().trim().min(5, "Full business address is required").max(500),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const agentProfileUpdateSchema = z.object({
  companyName: z.string().trim().min(2).max(150),
  ownerName: nameSchema,
  mobileNumber: phoneSchema.optional().or(z.literal("")),
  whatsappNumber: phoneSchema.optional().or(z.literal("")),
  country: countrySchema.optional().or(z.literal("")),
  state: stateSchema.optional().or(z.literal("")),
  city: citySchema.optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().default(""),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Enter a valid pincode")
    .optional()
    .or(z.literal("")),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(gstRegex, "Enter a valid 15-character GST number")
    .optional()
    .or(z.literal("")),
  verifiedCertificate: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  businessType: z.enum(SERVICE_SLUGS).optional().or(z.literal("")),
  businessEmail: emailSchema.optional().or(z.literal("")),
  businessPhone: phoneSchema.optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(80).nullable().optional(),
  totalBookings: z.coerce.number().int().min(0).nullable().optional(),
  startingPrice: z.coerce.number().min(0).nullable().optional(),
  govIdType: z.string().trim().max(100).optional().or(z.literal("")),
  govIdNumber: z.string().trim().max(50).optional().or(z.literal("")),
  services: z.array(z.enum(SERVICE_SLUGS)).max(SERVICE_SLUGS.length).optional().default([]),
});

export const locationSchema = z.object({
  country: countrySchema.optional().or(z.literal("")),
  state: stateSchema.optional().or(z.literal("")),
  city: citySchema.optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Enter a valid pincode")
    .optional()
    .or(z.literal("")),
  services: z.array(z.enum(SERVICE_SLUGS)).max(SERVICE_SLUGS.length).optional().default([]),
});

export const agentSignupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// A superadmin adding an agent directly (no signup, already verified &
// listed) only provides the basics — no email/password/documents. Business
// type is picked from the same service taxonomy used for homepage filtering
// (lib/services.ts), so the agent is immediately filterable there too.
export const superadminCreateAgentSchema = z.object({
  companyName: z.string().trim().min(2, "Business name is required").max(150),
  businessType: z.enum(SERVICE_SLUGS, { message: "Select a business type" }),
  mobileNumber: phoneSchema,
  whatsappNumber: phoneSchema,
  country: countrySchema,
  state: stateSchema,
  city: citySchema,
  verificationBadge: z.enum(VERIFICATION_BADGES).default("BLUE"),
});

export const rejectAgentSchema = z.object({
  rejectionReason: z.string().trim().min(5, "Provide a rejection reason").max(500),
});

export const approveAgentSchema = z.object({
  verificationBadge: z.enum(VERIFICATION_BADGES).default("BLUE"),
});

export const updateAgentBadgeSchema = z.object({
  verificationBadge: z.enum(VERIFICATION_BADGES),
});
