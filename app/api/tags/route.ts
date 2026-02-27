import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTag, createTagForStudent } from "@/lib/services/tag";

// POST /api/tags - Create new tag (professor only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Allow both professors and students to create tags.
    let tag;
    if (session.user.role === "student") {
      tag = await createTagForStudent(BigInt(session.user.id), name, description);
    } else {
      // professors and other roles create tags normally
      tag = await createTag(name, description);
    }

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
