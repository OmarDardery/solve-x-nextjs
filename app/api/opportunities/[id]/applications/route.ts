import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApplicationsByOpportunityId } from "@/lib/services/application";
import { getOpportunityById } from "@/lib/services/opportunity";

// GET /api/opportunities/[id]/applications - Get applications for an opportunity
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if the opportunity exists and belongs to the professor
    const opportunity = await getOpportunityById(BigInt(id));

    if (
      session.user.role === "professor" &&
      opportunity.professorId.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only view applications for your own opportunities" },
        { status: 403 }
      );
    }

    const applications = await getApplicationsByOpportunityId(BigInt(id));

    // Transform for API response
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
