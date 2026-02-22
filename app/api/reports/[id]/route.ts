import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteReport } from "@/lib/services/report";

type Props = {
  params: Promise<{ id: string }>;
};

// DELETE /api/reports/:id - Delete report (student only, own reports)
export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can delete their reports" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteReport(parseInt(id), parseInt(session.user.id));

    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: "Report not found or unauthorized" },
      { status: 403 }
    );
  }
}
