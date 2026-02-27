import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApplicationsByOpportunityId } from "@/lib/services/application";
import { getOpportunityById } from "@/lib/services/opportunity";

type ApplicationWithRelations = Awaited<ReturnType<typeof getApplicationsByOpportunityId>>[number];

// GET /api/opportunities/[id]/applications - Get applications for an opportunity
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if the opportunity exists and belongs to the requesting user (professor or student)
    const opportunity = await getOpportunityById(BigInt(id));
    const sessionId = session.user.id;
    const oppAny: any = opportunity;

    // Allow access if requester is the professor owner or the student owner
    const isProfessorOwner = oppAny.professorId ? oppAny.professorId.toString() === sessionId : false;
    const isStudentOwner = oppAny.studentId ? oppAny.studentId.toString() === sessionId : false;

    if (session.user.role === "professor" && !isProfessorOwner) {
      return NextResponse.json(
        { error: "You can only view applications for your own opportunities" },
        { status: 403 }
      );
    }

    if (session.user.role === "student" && !isStudentOwner) {
      return NextResponse.json(
        { error: "You can only view applications for your own opportunities" },
        { status: 403 }
      );
    }

    const applications = await getApplicationsByOpportunityId(BigInt(id));

    // Transform for API response (include both student and professor applicant fields)
    const transformed = applications.map((app: ApplicationWithRelations) => ({
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
      created_at: app.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: app.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get applications error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
