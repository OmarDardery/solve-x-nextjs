import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getReportsByStudentId,
  getReportsByRecipientId,
} from "@/lib/services/report";

// GET /api/reports/me - Get reports
// For students: their reports
// For professors: reports sent to them
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    if (session.user.role === "student") {
      const reports = await getReportsByStudentId(userId);
      return NextResponse.json(reports);
    } else if (session.user.role === "professor") {
      const reports = await getReportsByRecipientId(userId);
      return NextResponse.json(reports);
    } else {
      return NextResponse.json(
        { error: "Only students and professors can access reports" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Failed to get reports" },
      { status: 500 }
    );
  }
}
