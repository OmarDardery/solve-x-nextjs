import { NextResponse } from "next/server";
import { getEventsByOrganizationId } from "@/lib/services/event";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const events = await getEventsByOrganizationId(BigInt(id));
    return NextResponse.json(events);
  } catch (error) {
    console.error("Get organization events error:", error);
    return NextResponse.json(
      { error: "Failed to get events" },
      { status: 500 }
    );
  }
}
