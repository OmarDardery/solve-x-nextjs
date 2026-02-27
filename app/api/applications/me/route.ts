import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getApplicationsByApplicant,
  getApplicationsByOwnedOpportunities,
} from "@/lib/services/application";

// GET /api/applications/me - Get applications
// For students: their applications
// For professors: applications for their opportunities
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = BigInt(session.user.id);

    // For both roles, return submitted (applications by the user) and received (applications to opportunities the user owns)
    const applicantType = session.user.role === "professor" ? "PROFESSOR" : "STUDENT";

    const submitted = await getApplicationsByApplicant(applicantType, userId);
    // Received should be applications to opportunities the user owns
    const received = await getApplicationsByOwnedOpportunities(userId, session.user.role === "professor" ? "professor" : "student");

    const mapApp = (app: any) => ({
      id: app.id.toString(),
      student_id: app.studentId ? app.studentId.toString() : null,
      professor_applicant_id: app.professorApplicantId ? app.professorApplicantId.toString() : null,
      opportunity_id: app.opportunityId.toString(),
      status: app.status,
      message: app.message,
      resume_link: app.resumeLink,
      applicant_type: app.applicantType,
      student: app.student
        ? {
            id: app.student.id.toString(),
            first_name: app.student.firstName,
            last_name: app.student.lastName,
            email: app.student.email,
          }
        : undefined,
      professor_applicant: app.professorApplicant
        ? {
            id: app.professorApplicant.id.toString(),
            first_name: app.professorApplicant.firstName,
            last_name: app.professorApplicant.lastName,
            email: app.professorApplicant.email,
          }
        : undefined,
      opportunity: app.opportunity
        ? {
            id: app.opportunity.id.toString(),
            name: app.opportunity.name,
            created_at: app.opportunity.createdAt?.toISOString() || null,
            professor: app.opportunity.professor
              ? {
                  id: app.opportunity.professor.id.toString(),
                  first_name: app.opportunity.professor.firstName,
                  last_name: app.opportunity.professor.lastName,
                  email: app.opportunity.professor.email,
                }
              : undefined,
            student: app.opportunity.student
              ? {
                  id: app.opportunity.student.id.toString(),
                  first_name: app.opportunity.student.firstName,
                  last_name: app.opportunity.student.lastName,
                  email: app.opportunity.student.email,
                }
              : undefined,
          }
        : undefined,
      created_at: app.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: app.updatedAt?.toISOString() || new Date().toISOString(),
    });

    return NextResponse.json({ submitted: submitted.map(mapApp), received: received.map(mapApp) });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Failed to get applications" },
      { status: 500 }
    );
  }
}
