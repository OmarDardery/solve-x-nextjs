import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApplicationById, updateApplicationStatus, ApplicationStatus } from "@/lib/services/application";

type Props = {
  params: Promise<{ id: string }>;
};

// PUT /api/applications/:id/status - Professor updates application status
export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow professors or students to update status, but only if they own the opportunity
    if (session.user.role !== "professor" && session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only professors or students can update application status" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const applicationId = BigInt(id);

    // Get application and verify requester owns the opportunity (professor -> professorId, student -> studentId)
    const application = await getApplicationById(applicationId);
    const sessionIdBig = BigInt(session.user.id);
    const opp: any = application.opportunity;

    const isProfessorOwner = opp.professorId ? opp.professorId === sessionIdBig : false;
    const isStudentOwner = opp.studentId ? opp.studentId === sessionIdBig : false;

    if (session.user.role === "professor" && !isProfessorOwner) {
      return NextResponse.json(
        { error: "Cannot modify applications for opportunities you don't own" },
        { status: 403 }
      );
    }

    if (session.user.role === "student" && !isStudentOwner) {
      return NextResponse.json(
        { error: "Cannot modify applications for opportunities you don't own" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await updateApplicationStatus(applicationId, status as ApplicationStatus);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update application status error:", error);
    const message = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
