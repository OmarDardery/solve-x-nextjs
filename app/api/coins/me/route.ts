import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCoinsByStudentId } from "@/lib/services/coins";

// GET /api/coins/me - Get student's coins
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can access coins" },
        { status: 403 }
      );
    }

    const coins = await getCoinsByStudentId(parseInt(session.user.id));
    return NextResponse.json(coins);
  } catch (error) {
    console.error("Get coins error:", error);
    return NextResponse.json(
      { error: "Failed to get coins" },
      { status: 500 }
    );
  }
}
