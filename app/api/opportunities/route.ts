import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllOpportunities, createOpportunityByOwner } from "@/lib/services/opportunity";

// GET /api/opportunities - Get all opportunities
export async function GET() {
  try {
    const opportunities = await getAllOpportunities();
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Get opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunities" },
      { status: 500 }
    );
  }
}

// POST /api/opportunities - Create new opportunity (professor only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor" && session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only professors or students can create opportunities" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, details, requirements, reward, type, tag_ids } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Create based on session role: professor -> professorId, student -> studentId
    const ownerType = session.user.role === "professor" ? "professor" : "student";
    const opportunity = await createOpportunityByOwner(
      ownerType as "professor" | "student",
      BigInt(session.user.id),
      name,
      details || null,
      requirements || null,
      reward || null,
      type,
      tag_ids
    );

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Create opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    );
  }
}
