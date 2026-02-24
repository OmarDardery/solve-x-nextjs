import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createEvent } from "@/lib/services/event";

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
      BigInt(session.user.id),
      title,
      description,
      date,
      link,
      sign_up_link
    );

    const transformed = {
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      link: event.link || null,
      sign_up_link: event.signUpLink || null,
      organization_id: event.organizationId?.toString(),
      organization: event.organization
        ? {
            id: event.organization.id.toString(),
            name: event.organization.name,
            email: event.organization.email,
            contact: event.organization.contact,
            link: event.organization.link,
          }
        : undefined,
      created_at: event.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: event.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(transformed, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
