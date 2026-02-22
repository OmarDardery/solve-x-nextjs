import { NextResponse } from "next/server";
import { getAllOpportunities, getOpportunityById } from "@/lib/services/opportunity";

export async function GET() {
  try {
    const opportunities = await getAllOpportunities();
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Get opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunities" },
      { status: 500 }
    );
  }
}
