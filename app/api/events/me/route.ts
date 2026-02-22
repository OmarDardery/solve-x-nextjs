import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEventsByOrganizationId } from "@/lib/services/event";

// GET /api/events/me - Get organization's events
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "organization") {
      return NextResponse.json(
        { error: "Only organizations can access their events" },
        { status: 403 }
      );
    }

    const events = await getEventsByOrganizationId(parseInt(session.user.id));
    return NextResponse.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to get events" },
      { status: 500 }
    );
  }
}
