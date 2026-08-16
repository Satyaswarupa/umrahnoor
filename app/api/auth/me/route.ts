import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { toSafeUser } from "@/lib/serializers";
import { serverErrorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("me error", error);
    return serverErrorResponse();
  }
}
