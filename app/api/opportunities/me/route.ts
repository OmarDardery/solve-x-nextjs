import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOpportunitiesByOwner } from "@/lib/services/opportunity";

// GET /api/opportunities/me - Get professor's opportunities
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor" && session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only professors or students can access their opportunities" },
        { status: 403 }
      );
    }

    const ownerType = session.user.role === "professor" ? "professor" : "student";
    const opportunities = await getOpportunitiesByOwner(ownerType as "professor" | "student", BigInt(session.user.id));
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Get opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunities" },
      { status: 500 }
    );
  }
}
