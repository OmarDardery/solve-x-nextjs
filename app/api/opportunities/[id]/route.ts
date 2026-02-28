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
    const opp: any = opportunity;
    const mapped = {
      id: opp.id?.toString(),
      name: opp.name,
      details: opp.details,
      requirements: opp.requirements,
      reward: opp.reward,
      type: opp.type,
      link: opp.link,
      sign_up_link: opp.signUpLink || opp.sign_up_link || null,
      professor_id: opp.professorId ? String(opp.professorId) : null,
      professor: opp.professor
        ? {
            id: opp.professor.id?.toString(),
            first_name: opp.professor.firstName,
            last_name: opp.professor.lastName,
            email: opp.professor.email,
          }
        : undefined,
      student_id: opp.studentId ? String(opp.studentId) : null,
      student: opp.student
        ? {
            id: opp.student.id?.toString(),
            first_name: opp.student.firstName,
            last_name: opp.student.lastName,
            email: opp.student.email,
          }
        : undefined,
      requirement_tags: Array.isArray(opp.opportunity_tags)
        ? opp.opportunity_tags.map((ot: any) => ({ id: ot.tags.id?.toString(), name: ot.tags.name }))
        : [],
      created_at: opp.createdAt?.toISOString(),
      updated_at: opp.updatedAt?.toISOString(),
    };

    return NextResponse.json(mapped);
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
