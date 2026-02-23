import { NextResponse } from "next/server";
import { getOrganizationById } from "@/lib/services/organization";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const organization = await getOrganizationById(BigInt(id));
    
    // Return organization without sensitive data
    const { password, ...safeOrg } = organization as typeof organization & { password?: string };
    return NextResponse.json(safeOrg);
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }
}
