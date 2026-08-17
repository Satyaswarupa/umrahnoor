import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

export const VERIFICATION_STATUSES = [
  "INCOMPLETE",
  "PENDING",
  "VERIFIED",
  "REJECTED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

const DocumentSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    name: { type: String },
  },
  { _id: false }
);

const LocationSchema = new Schema({
  country: { type: String, default: "", trim: true },
  state: { type: String, default: "", trim: true },
  city: { type: String, default: "", trim: true },
  address: { type: String, default: "", trim: true },
  pincode: { type: String, default: "", trim: true },
  services: { type: [String], default: [] },
});

const AgentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    companyName: { type: String, default: "", trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, default: "", trim: true },
    whatsappNumber: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true, index: true },
    state: { type: String, default: "", trim: true, index: true },
    city: { type: String, default: "", trim: true, index: true },
    address: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    gstNumber: { type: String, default: "", trim: true },
    gstDocument: { type: DocumentSchema, default: null },
    verifiedCertificate: { type: String, default: "", trim: true },
    certificateDocument: { type: DocumentSchema, default: null },
    additionalDocuments: { type: [DocumentSchema], default: [] },
    description: { type: String, default: "", trim: true },
    businessType: { type: String, default: "", trim: true },
    businessEmail: { type: String, default: "", lowercase: true, trim: true },
    businessPhone: { type: String, default: "", trim: true },
    experienceYears: { type: Number, default: null },
    totalBookings: { type: Number, default: null },
    startingPrice: { type: Number, default: null },
    govIdType: { type: String, default: "", trim: true },
    govIdNumber: { type: String, default: "", trim: true },
    govIdDocument: { type: DocumentSchema, default: null },
    tradeLicenseDocument: { type: DocumentSchema, default: null },
    gstCertificateDocument: { type: DocumentSchema, default: null },
    profileImage: { type: DocumentSchema, default: null },
    services: { type: [String], default: [], index: true },
    locations: { type: [LocationSchema], default: [] },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      required: true,
      default: "INCOMPLETE",
      index: true,
    },
    isListed: { type: Boolean, required: true, default: false, index: true },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

AgentSchema.index({
  country: 1,
  state: 1,
  city: 1,
  verificationStatus: 1,
  isListed: 1,
});

AgentSchema.index({
  "locations.state": 1,
  "locations.city": 1,
  "locations.services": 1,
  verificationStatus: 1,
  isListed: 1,
});

export type AgentDocument = InferSchemaType<typeof AgentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Agent = models.Agent || model("Agent", AgentSchema);
