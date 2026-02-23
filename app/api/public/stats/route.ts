import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/public/stats - Get platform statistics (public)
export async function GET() {
  try {
    const [
      totalStudents,
      totalProfessors,
      totalOrganizations,
      totalOpportunities,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.professor.count(),
      prisma.organization.count(),
      prisma.opportunity.count(),
    ]);

    return NextResponse.json({
      total_students: totalStudents,
      total_professors: totalProfessors,
      total_organizations: totalOrganizations,
      total_opportunities: totalOpportunities,
      active_opportunities: totalOpportunities, // All opportunities are active for now
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
