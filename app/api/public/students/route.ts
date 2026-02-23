import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/public/students - Get all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
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
    const transformed = students.map((s) => ({
      id: s.id.toString(),
      first_name: s.firstName,
      last_name: s.lastName,
      email: s.email,
      created_at: s.createdAt?.toISOString(),
      updated_at: s.updatedAt?.toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json(
      { error: "Failed to get students" },
      { status: 500 }
    );
  }
}
