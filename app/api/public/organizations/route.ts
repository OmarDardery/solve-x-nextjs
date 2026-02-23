import { NextResponse } from "next/server";
import { getAllOrganizations } from "@/lib/services/organization";

// GET /api/public/organizations - Get all organizations (public)
export async function GET() {
  try {
    const organizations = await getAllOrganizations();

    // Transform for API response
    const transformed = organizations.map((org) => ({
      id: org.id.toString(),
      name: org.name,
      email: org.email,
      contact: org.contact,
      link: org.link,
      created_at: org.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: org.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Get organizations error:", error);
    return NextResponse.json(
      { error: "Failed to get organizations" },
      { status: 500 }
    );
  }
}
