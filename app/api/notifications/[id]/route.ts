import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteNotification } from "@/lib/services/notification";

type Props = {
  params: Promise<{ id: string }>;
};

// DELETE /api/notifications/:id - Delete notification
export async function DELETE(_request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user;
    if (role !== "student" && role !== "professor") {
      return NextResponse.json(
        { error: "Invalid role for notifications" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = BigInt(session.user.id);

    await deleteNotification(BigInt(id), userId);

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Notification not found or unauthorized" },
      { status: 403 }
    );
  }
}
