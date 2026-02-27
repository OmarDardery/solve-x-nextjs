import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createApplication,
  deleteApplication,
} from "@/lib/services/application";
import { getOpportunityById } from "@/lib/services/opportunity";

// POST /api/applications - Student submits an application
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student" && session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only students or professors can submit applications" },
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

    // Check if opportunity exists and ensure user is not the owner
    const oppId = BigInt(opportunity_id);
    const opportunity = await getOpportunityById(oppId);

    // Prevent users from applying to opportunities they own
    const userIdStr = session.user.id;
    if (session.user.role === "student" && opportunity.student && opportunity.student.id?.toString() === userIdStr) {
      return NextResponse.json({ error: "You cannot apply to an opportunity you created" }, { status: 400 });
    }
    if (session.user.role === "professor" && opportunity.professor && opportunity.professor.id?.toString() === userIdStr) {
      return NextResponse.json({ error: "You cannot apply to an opportunity you created" }, { status: 400 });
    }

    const applicantType = session.user.role === "professor" ? "PROFESSOR" : "STUDENT";
    const application = await createApplication(
      applicantType,
      BigInt(session.user.id),
      oppId,
      message,
      resume_link
    );

    const transformedApplication = {
      id: application.id.toString(),
      student_id: application.studentId ? application.studentId.toString() : null,
      professor_applicant_id: application.professorApplicantId ? application.professorApplicantId.toString() : null,
      opportunity_id: application.opportunityId.toString(),
      status: application.status,
      message: application.message,
      resume_link: application.resumeLink,
      applicant_type: application.applicantType,
      student: application.student
        ? {
            id: application.student.id.toString(),
            first_name: application.student.firstName,
            last_name: application.student.lastName,
            email: application.student.email,
          }
        : undefined,
      professor_applicant: application.professorApplicant
        ? {
            id: application.professorApplicant.id.toString(),
            first_name: application.professorApplicant.firstName,
            last_name: application.professorApplicant.lastName,
            email: application.professorApplicant.email,
          }
        : undefined,
      created_at: application.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: application.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(
      { message: "Application submitted successfully", application: transformedApplication },
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

    if (session.user.role !== "student" && session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only students or professors can delete their applications" },
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

    const applicantType = session.user.role === "professor" ? "PROFESSOR" : "STUDENT";
    await deleteApplication(applicantType, BigInt(session.user.id), BigInt(opportunity_id));

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
