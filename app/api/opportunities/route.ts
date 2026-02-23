import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOpportunity, OpportunityType } from "@/lib/services/opportunity";

// POST /api/opportunities - Create new opportunity (professor only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only professors can create opportunities" },
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

    const opportunity = await createOpportunity(
      BigInt(session.user.id),
      name,
      details || null,
      requirements || null,
      reward || null,
      type as OpportunityType,
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
