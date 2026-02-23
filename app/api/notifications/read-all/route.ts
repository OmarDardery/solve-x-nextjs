import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAllNotificationsAsRead, RecipientRole } from "@/lib/services/notification";

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT() {
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

    const userId = BigInt(session.user.id);
    await markAllNotificationsAsRead(userId, role as RecipientRole);

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
