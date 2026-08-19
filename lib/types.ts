export type AgentDoc = {
  url: string;
  publicId: string;
  name?: string | null;
};

export type AgentLocation = {
  id: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  services: string[];
};

export type PrivateAgent = {
  id: string;
  userId: string;
  companyName: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  gstNumber: string;
  gstDocument: AgentDoc | null;
  verifiedCertificate: string;
  certificateDocument: AgentDoc | null;
  additionalDocuments: AgentDoc[];
  description: string;
  businessType: string;
  businessEmail: string;
  businessPhone: string;
  experienceYears: number | null;
  totalBookings: number | null;
  startingPrice: number | null;
  govIdType: string;
  govIdNumber: string;
  govIdDocument: AgentDoc | null;
  tradeLicenseDocument: AgentDoc | null;
  gstCertificateDocument: AgentDoc | null;
  profileImage: AgentDoc | null;
  services: string[];
  locations: AgentLocation[];
  verificationStatus: "INCOMPLETE" | "PENDING" | "VERIFIED" | "REJECTED";
  isListed: boolean;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

// Shape returned by lib/serializers.ts's toPublicAgentSummary/toPublicAgentDetail —
// what /api/agents and /api/agents/[id] send to the homepage's agent grid and
// the mobile app.
export type PublicAgentSummary = {
  id: string;
  companyName: string;
  mobileNumber: string;
  whatsappNumber: string;
  country: string;
  state: string;
  city: string;
  description: string;
  services: string[];
  profileImage?: AgentDoc | null;
  experienceYears?: number | null;
  startingPrice?: number | null;
  // Only set when /api/agents fell back from "no agent in this exact city"
  // to ranking agents elsewhere in the state by real distance.
  distanceKm?: number;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
};
