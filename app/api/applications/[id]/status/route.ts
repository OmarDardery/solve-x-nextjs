import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApplicationById, updateApplicationStatus } from "@/lib/services/application";
import { ApplicationStatus } from "@prisma/client";

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

    if (session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only professors can update application status" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const applicationId = parseInt(id);

    // Get application and verify professor owns the opportunity
    const application = await getApplicationById(applicationId);
    if (application.opportunity.professorId !== parseInt(session.user.id)) {
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
