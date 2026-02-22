import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createReport,
  getReportsByStudentId,
  getReportsByRecipientId,
} from "@/lib/services/report";

// POST /api/reports - Create new report (student only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can submit reports" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipient_id, drive_link } = body;

    if (!recipient_id || !drive_link) {
      return NextResponse.json(
        { error: "Recipient ID and drive link are required" },
        { status: 400 }
      );
    }

    const report = await createReport(
      parseInt(session.user.id),
      recipient_id,
      drive_link
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Create report error:", error);
    const message = error instanceof Error ? error.message : "Failed to create report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
