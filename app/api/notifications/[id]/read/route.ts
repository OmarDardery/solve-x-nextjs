import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markNotificationAsRead } from "@/lib/services/notification";

type Props = {
  params: Promise<{ id: string }>;
};

// PUT /api/notifications/:id/read - Mark notification as read
export async function PUT(request: Request, { params }: Props) {
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
    const userId = parseInt(session.user.id);

    await markNotificationAsRead(parseInt(id), userId);

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Notification not found or unauthorized" },
      { status: 403 }
    );
  }
}
