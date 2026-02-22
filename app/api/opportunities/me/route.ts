import { NextResponse } from "next/server";
import { auth, getCurrentUser } from "@/lib/auth";
import {
  createOpportunity,
  getOpportunitiesByProfessorId,
} from "@/lib/services/opportunity";
import { OpportunityType } from "@prisma/client";

// GET /api/opportunities/me - Get professor's opportunities
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only professors can access their opportunities" },
        { status: 403 }
      );
    }

    const opportunities = await getOpportunitiesByProfessorId(
      parseInt(session.user.id)
    );
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Get opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunities" },
      { status: 500 }
    );
  }
}
