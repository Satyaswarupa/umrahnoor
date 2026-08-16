import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Agent } from "@/models/Agent";
import { getSession } from "@/lib/auth";
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    await connectToDatabase();

    const [totalUsers, totalAgents, pendingAgents, verifiedAgents, rejectedAgents] =
      await Promise.all([
        User.countDocuments({ role: "USER" }),
        Agent.countDocuments({}),
        Agent.countDocuments({ verificationStatus: "PENDING" }),
        Agent.countDocuments({ verificationStatus: "VERIFIED" }),
        Agent.countDocuments({ verificationStatus: "REJECTED" }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalAgents,
      pendingAgents,
      verifiedAgents,
      rejectedAgents,
    });
  } catch (error) {
    console.error("superadmin overview error", error);
    return serverErrorResponse();
  }
}
