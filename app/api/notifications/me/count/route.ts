import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/services/notification";
import { RecipientRole } from "@prisma/client";

// GET /api/notifications/me/count - Get unread notification count
export async function GET() {
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

    const userId = parseInt(session.user.id);
    const count = await getUnreadNotificationCount(userId, role as RecipientRole);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Get notification count error:", error);
    return NextResponse.json(
      { error: "Failed to get notification count" },
      { status: 500 }
    );
  }
}
