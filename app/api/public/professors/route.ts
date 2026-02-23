import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/public/professors - Get all professors
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { firstName: "asc" },
    });

    // Transform to snake_case for frontend
    const transformed = professors.map((p) => ({
      id: p.id.toString(),
      first_name: p.firstName,
      last_name: p.lastName,
      email: p.email,
      created_at: p.createdAt?.toISOString(),
      updated_at: p.updatedAt?.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get professors error:", error);
    return NextResponse.json(
      { error: "Failed to get professors" },
      { status: 500 }
    );
  }
}
