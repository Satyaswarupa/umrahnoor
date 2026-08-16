import { z } from "zod";

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
  mobileNumber: phoneSchema,
  whatsappNumber: phoneSchema,
  country: countrySchema,
  state: stateSchema,
  city: citySchema,
  address: z.string().trim().min(5).max(500),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(gstRegex, "Enter a valid 15-character GST number")
    .or(z.literal("")),
  verifiedCertificate: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
});

export const rejectAgentSchema = z.object({
  rejectionReason: z.string().trim().min(5, "Provide a rejection reason").max(500),
});
