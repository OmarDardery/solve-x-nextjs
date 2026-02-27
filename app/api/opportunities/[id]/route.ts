import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "@/lib/services/opportunity";

type Props = {
  params: Promise<{ id: string }>;
};

// GET /api/opportunities/:id
export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const opportunity = await getOpportunityById(BigInt(id));
    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }
}

// PUT /api/opportunities/:id - Update opportunity (professor only)
export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor" && session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only professors or students can update opportunities" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const opportunityId = BigInt(id);

    // Check ownership
    const opportunity = await getOpportunityById(opportunityId);
    const sessionId = BigInt(session.user.id);
    const oppAny: any = opportunity;
    if (oppAny.professorId !== sessionId && oppAny.studentId !== sessionId) {
      return NextResponse.json(
        { error: "Cannot modify opportunities you don't own" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateOpportunity(opportunityId, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunities/:id - Delete opportunity (professor only)
export async function DELETE(_request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor" && session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only professors or students can delete opportunities" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const opportunityId = BigInt(id);

    // Check ownership
    const opportunity = await getOpportunityById(opportunityId);
    const sessionId = BigInt(session.user.id);
    const oppAny: any = opportunity;
    if (oppAny.professorId !== sessionId && oppAny.studentId !== sessionId) {
      return NextResponse.json(
        { error: "Cannot delete opportunities you don't own" },
        { status: 403 }
      );
    }

    await deleteOpportunity(opportunityId);

    return NextResponse.json({ message: "Opportunity deleted" });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
