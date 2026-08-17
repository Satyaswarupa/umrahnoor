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

type LocationFilter = { country?: string; state?: string; city?: string };

// Agents submitted through the legacy GST flow carry their location on the
// top-level country/state/city/address fields. Agents submitted through the
// newer multi-location flow leave those blank and store one or more entries
// in `locations` instead — so fall back to a matching (or first) location
// whenever the top-level fields are empty.
function pickDisplayLocation(agent: LeanAgent, filter?: LocationFilter) {
  if (agent.city || agent.state || agent.country) {
    return { country: agent.country, state: agent.state, city: agent.city, address: agent.address };
  }

  const locations = agent.locations ?? [];
  const matched = filter
    ? locations.find(
        (location) =>
          (!filter.country || location.country === filter.country) &&
          (!filter.state || location.state === filter.state) &&
          (!filter.city || location.city === filter.city),
      )
    : undefined;
  const location = matched ?? locations[0];

  return {
    country: location?.country ?? "",
    state: location?.state ?? "",
    city: location?.city ?? "",
    address: location?.address ?? "",
  };
}

// Sent by /api/agents to the homepage's agent grid and the mobile app. No
// contact-person, address, or documents.
export function toPublicAgentSummary(agent: LeanAgent, filter?: LocationFilter) {
  const location = pickDisplayLocation(agent, filter);
  return {
    id: String(agent._id),
    companyName: agent.companyName,
    mobileNumber: agent.mobileNumber,
    whatsappNumber: agent.whatsappNumber,
    country: location.country,
    state: location.state,
    city: location.city,
    description: agent.description,
    services: agent.services ?? [],
    profileImage: agent.profileImage,
    experienceYears: agent.experienceYears,
    startingPrice: agent.startingPrice,
  };
}

// Shown on the public /agents/[id] detail page. Still no GST/certificate/internal fields.
export function toPublicAgentDetail(agent: LeanAgent, filter?: LocationFilter) {
  const location = pickDisplayLocation(agent, filter);
  return {
    id: String(agent._id),
    companyName: agent.companyName,
    ownerName: agent.ownerName,
    mobileNumber: agent.mobileNumber,
    whatsappNumber: agent.whatsappNumber,
    country: location.country,
    state: location.state,
    city: location.city,
    address: location.address,
    description: agent.description,
    services: agent.services ?? [],
    profileImage: agent.profileImage,
    experienceYears: agent.experienceYears,
    startingPrice: agent.startingPrice,
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
    pincode: agent.pincode,
    gstNumber: agent.gstNumber,
    gstDocument: agent.gstDocument,
    verifiedCertificate: agent.verifiedCertificate,
    certificateDocument: agent.certificateDocument,
    additionalDocuments: agent.additionalDocuments,
    description: agent.description,
    businessType: agent.businessType,
    businessEmail: agent.businessEmail,
    businessPhone: agent.businessPhone,
    experienceYears: agent.experienceYears,
    totalBookings: agent.totalBookings,
    startingPrice: agent.startingPrice,
    govIdType: agent.govIdType,
    govIdNumber: agent.govIdNumber,
    govIdDocument: agent.govIdDocument,
    tradeLicenseDocument: agent.tradeLicenseDocument,
    gstCertificateDocument: agent.gstCertificateDocument,
    profileImage: agent.profileImage,
    services: agent.services ?? [],
    locations: (agent.locations ?? []).map((location) => ({
      id: String((location as { _id: unknown })._id),
      country: location.country,
      state: location.state,
      city: location.city,
      address: location.address,
      pincode: location.pincode,
      services: location.services ?? [],
    })),
    verificationStatus: agent.verificationStatus,
    isListed: agent.isListed,
    rejectionReason: agent.rejectionReason,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
