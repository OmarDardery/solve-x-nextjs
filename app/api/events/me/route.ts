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

    const events = await getEventsByOrganizationId(BigInt(session.user.id));
    const transformed = events.map((ev) => ({
      id: ev.id.toString(),
      title: ev.title,
      description: ev.description,
      date: ev.date,
      link: ev.link || null,
      sign_up_link: ev.signUpLink || null,
      organization_id: ev.organizationId?.toString(),
      organization: ev.organization
        ? {
            id: ev.organization.id.toString(),
            name: ev.organization.name,
            email: ev.organization.email,
            contact: ev.organization.contact,
            link: ev.organization.link,
          }
        : undefined,
      created_at: ev.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: ev.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to get events" },
      { status: 500 }
    );
  }
}
