import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/services/tag";

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "Failed to get tags" },
      { status: 500 }
    );
  }
}
