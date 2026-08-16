import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { toSafeUser } from "@/lib/serializers";
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    if (session.role !== "SUPERADMIN") return forbiddenResponse();

    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ users: users.map(toSafeUser) });
  } catch (error) {
    console.error("superadmin users list error", error);
    return serverErrorResponse();
  }
}
