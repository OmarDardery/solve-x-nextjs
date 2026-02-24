import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getApplicationsByStudentId,
  getApplicationsByProfessorOpportunities,
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

    if (session.user.role === "student") {
      const applications = await getApplicationsByStudentId(userId);
      const transformed = applications.map((app) => ({
        id: app.id.toString(),
        student_id: app.studentId.toString(),
        opportunity_id: app.opportunityId.toString(),
        status: app.status,
        message: app.message,
        resume_link: app.resumeLink,
        student: app.student
          ? {
              id: app.student.id.toString(),
              first_name: app.student.firstName,
              last_name: app.student.lastName,
              email: app.student.email,
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
            }
          : undefined,
        created_at: app.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: app.updatedAt?.toISOString() || new Date().toISOString(),
      }));

      return NextResponse.json(transformed);
    } else if (session.user.role === "professor") {
      const applications = await getApplicationsByProfessorOpportunities(userId);

      const transformed = applications.map((app) => ({
        id: app.id.toString(),
        student_id: app.studentId.toString(),
        opportunity_id: app.opportunityId.toString(),
        status: app.status,
        message: app.message,
        resume_link: app.resumeLink,
        student: app.student
          ? {
              id: app.student.id.toString(),
              first_name: app.student.firstName,
              last_name: app.student.lastName,
              email: app.student.email,
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
            }
          : undefined,
        created_at: app.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: app.updatedAt?.toISOString() || new Date().toISOString(),
      }));

      return NextResponse.json(transformed);
    } else {
      return NextResponse.json(
        { error: "Only students and professors can access applications" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Failed to get applications" },
      { status: 500 }
    );
  }
}
