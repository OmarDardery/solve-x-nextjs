import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotificationsByRecipient, RecipientRole } from "@/lib/services/notification";

// GET /api/notifications/me - Get notifications
export async function GET(request: Request) {
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
    
    // Check for unread_only query param
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread_only") === "true";

    const notifications = await getNotificationsByRecipient(
      userId,
      role as RecipientRole,
      unreadOnly
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    );
  }
}
