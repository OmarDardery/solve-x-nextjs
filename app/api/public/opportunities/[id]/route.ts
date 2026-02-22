import { NextResponse } from "next/server";
import { getOpportunityById } from "@/lib/services/opportunity";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const opportunity = await getOpportunityById(parseInt(id));
    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }
}
