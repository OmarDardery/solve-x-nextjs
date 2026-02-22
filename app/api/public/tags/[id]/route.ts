import { NextResponse } from "next/server";
import { getTagById } from "@/lib/services/tag";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const tag = await getTagById(parseInt(id));
    return NextResponse.json(tag);
  } catch (error) {
    console.error("Get tag error:", error);
    return NextResponse.json(
      { error: "Tag not found" },
      { status: 404 }
    );
  }
}
