import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { incrementCoins } from "@/lib/services/coins";

// POST /api/coins/increment - Increment student's coins
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can increment coins" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    await incrementCoins(BigInt(session.user.id), amount);

    return NextResponse.json({ message: "Coins incremented" });
  } catch (error) {
    console.error("Increment coins error:", error);
    return NextResponse.json(
      { error: "Failed to increment coins" },
      { status: 500 }
    );
  }
}
