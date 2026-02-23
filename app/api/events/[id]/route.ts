import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getEventById,
  updateEvent,
  deleteEventByIdAndOrg,
} from "@/lib/services/event";

type Props = {
  params: Promise<{ id: string }>;
};

// GET /api/events/:id
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const event = await getEventById(BigInt(id));
    return NextResponse.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
}

// PUT /api/events/:id - Update event (organization only)
export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "organization") {
      return NextResponse.json(
        { error: "Only organizations can update events" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = BigInt(id);

    // Check ownership
    const event = await getEventById(eventId);
    if (event.organizationId !== BigInt(session.user.id)) {
      return NextResponse.json(
        { error: "You can only edit your own events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateEvent(eventId, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - Delete event (organization only)
export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "organization") {
      return NextResponse.json(
        { error: "Only organizations can delete events" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = BigInt(id);

    await deleteEventByIdAndOrg(eventId, BigInt(session.user.id));

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Event not found or unauthorized" },
      { status: 404 }
    );
  }
}
