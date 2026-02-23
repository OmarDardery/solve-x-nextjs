import { NextResponse } from "next/server";
import { getEventById } from "@/lib/services/event";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const event = await getEventById(BigInt(id));
    return NextResponse.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }
}
