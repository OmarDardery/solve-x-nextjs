import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createEvent, getEventsByOrganizationId } from "@/lib/services/event";

// POST /api/events - Create new event (organization only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "organization") {
      return NextResponse.json(
        { error: "Only organizations can create events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, date, link, sign_up_link } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const event = await createEvent(
      parseInt(session.user.id),
      title,
      description,
      date,
      link,
      sign_up_link
    );

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
