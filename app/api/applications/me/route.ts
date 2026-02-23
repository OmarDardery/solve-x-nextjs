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
      return NextResponse.json(applications);
    } else if (session.user.role === "professor") {
      const applications = await getApplicationsByProfessorOpportunities(userId);
      return NextResponse.json(applications);
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
