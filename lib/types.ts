export type AgentDoc = {
  url: string;
  publicId: string;
  name?: string;
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
  gstNumber: string;
  gstDocument: AgentDoc | null;
  verifiedCertificate: string;
  certificateDocument: AgentDoc | null;
  additionalDocuments: AgentDoc[];
  description: string;
  verificationStatus: "INCOMPLETE" | "PENDING" | "VERIFIED" | "REJECTED";
  isListed: boolean;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
};
