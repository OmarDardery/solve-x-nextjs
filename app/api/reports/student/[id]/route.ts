import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReportsByStudentId } from "@/lib/services/report";

type Props = {
  params: Promise<{ id: string }>;
};

// GET /api/reports/student/:id - Get reports by student (professor only)
export async function GET(_request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professor") {
      return NextResponse.json(
        { error: "Only professors can view student reports" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const reports = await getReportsByStudentId(BigInt(id));

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Get student reports error:", error);
    return NextResponse.json(
      { error: "Failed to get reports" },
      { status: 500 }
    );
  }
}
