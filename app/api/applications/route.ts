import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createApplication,
  deleteApplication,
  getApplicationsByStudentId,
  getApplicationsByProfessorOpportunities,
} from "@/lib/services/application";
import { getOpportunityById } from "@/lib/services/opportunity";

// POST /api/applications - Student submits an application
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can submit applications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { opportunity_id, message, resume_link } = body;

    if (!opportunity_id) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    // Check if opportunity exists
    await getOpportunityById(opportunity_id);

    const application = await createApplication(
      BigInt(session.user.id),
      opportunity_id,
      message,
      resume_link
    );

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create application error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/applications - Student deletes their application
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can delete their applications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { opportunity_id } = body;

    if (!opportunity_id) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    await deleteApplication(BigInt(session.user.id), opportunity_id);

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
