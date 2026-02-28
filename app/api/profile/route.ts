import { NextResponse } from "next/server";
import { auth, getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, role } = await getCurrentUser(session);

    // Normalize fields to snake_case for frontend consistency
    let transformed: any = { role };

    const u: any = user;

    switch (role) {
      case "student":
        transformed = {
          ...transformed,
          id: u.id?.toString ? u.id.toString() : String(u.id),
          first_name: u.firstName || u.first_name || "",
          last_name: u.lastName || u.last_name || "",
          email: u.email || null,
          created_at: u.createdAt ? u.createdAt.toISOString() : null,
          updated_at: u.updatedAt ? u.updatedAt.toISOString() : null,
        };
        break;
      case "professor":
        transformed = {
          ...transformed,
          id: u.id?.toString ? u.id.toString() : String(u.id),
          first_name: u.firstName || u.first_name || "",
          last_name: u.lastName || u.last_name || "",
          email: u.email || null,
          created_at: u.createdAt ? u.createdAt.toISOString() : null,
          updated_at: u.updatedAt ? u.updatedAt.toISOString() : null,
        };
        break;
      case "organization":
        transformed = {
          ...transformed,
          id: u.id?.toString ? u.id.toString() : String(u.id),
          name: u.name || null,
          email: u.email || null,
          contact: u.contact || null,
          link: u.link || null,
          created_at: u.createdAt ? u.createdAt.toISOString() : null,
          updated_at: u.updatedAt ? u.updatedAt.toISOString() : null,
        };
        break;
      default:
        transformed = { role, ...(u || {}) };
    }

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = BigInt(session.user.id);
    const role = session.user.role;

    let transformed;

    switch (role) {
      case "student": {
        const updatedUser = await prisma.student.update({
          where: { id: userId },
          data: {
            firstName: body.first_name,
            lastName: body.last_name,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        transformed = {
          id: updatedUser.id.toString(),
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          email: updatedUser.email,
          created_at: updatedUser.createdAt?.toISOString(),
          updated_at: updatedUser.updatedAt?.toISOString(),
        };
        break;
      }

      case "professor": {
        const updatedUser = await prisma.professor.update({
          where: { id: userId },
          data: {
            firstName: body.first_name,
            lastName: body.last_name,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        transformed = {
          id: updatedUser.id.toString(),
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          email: updatedUser.email,
          created_at: updatedUser.createdAt?.toISOString(),
          updated_at: updatedUser.updatedAt?.toISOString(),
        };
        break;
      }

      case "organization": {
        const updatedUser = await prisma.organization.update({
          where: { id: userId },
          data: {
            name: body.name,
            contact: body.contact,
            link: body.link,
          },
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
            link: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        transformed = {
          id: updatedUser.id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          contact: updatedUser.contact,
          link: updatedUser.link,
          created_at: updatedUser.createdAt?.toISOString(),
          updated_at: updatedUser.updatedAt?.toISOString(),
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
    }

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
