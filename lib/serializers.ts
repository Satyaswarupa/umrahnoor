import type { AgentDocument } from "@/models/Agent";
import type { UserDocument } from "@/models/User";

type LeanAgent = AgentDocument & { _id: unknown };
type LeanUser = UserDocument & { _id: unknown };

export function toSafeUser(user: LeanUser) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// Shown on the public /agents listing page. No contact-person, address, or documents.
export function toPublicAgentSummary(agent: LeanAgent) {
  return {
    id: String(agent._id),
    companyName: agent.companyName,
    mobileNumber: agent.mobileNumber,
    whatsappNumber: agent.whatsappNumber,
    country: agent.country,
    state: agent.state,
    city: agent.city,
    description: agent.description,
  };
}

// Shown on the public /agents/[id] detail page. Still no GST/certificate/internal fields.
export function toPublicAgentDetail(agent: LeanAgent) {
  return {
    id: String(agent._id),
    companyName: agent.companyName,
    ownerName: agent.ownerName,
    mobileNumber: agent.mobileNumber,
    whatsappNumber: agent.whatsappNumber,
    country: agent.country,
    state: agent.state,
    city: agent.city,
    address: agent.address,
    description: agent.description,
  };
}

// Full record for the owning agent's dashboard or superadmin review. Never send to the public site.
export function toPrivateAgent(agent: LeanAgent) {
  return {
    id: String(agent._id),
    userId: String(agent.userId),
    companyName: agent.companyName,
    ownerName: agent.ownerName,
    email: agent.email,
    mobileNumber: agent.mobileNumber,
    whatsappNumber: agent.whatsappNumber,
    country: agent.country,
    state: agent.state,
    city: agent.city,
    address: agent.address,
    gstNumber: agent.gstNumber,
    gstDocument: agent.gstDocument,
    verifiedCertificate: agent.verifiedCertificate,
    certificateDocument: agent.certificateDocument,
    additionalDocuments: agent.additionalDocuments,
    description: agent.description,
    verificationStatus: agent.verificationStatus,
    isListed: agent.isListed,
    rejectionReason: agent.rejectionReason,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
