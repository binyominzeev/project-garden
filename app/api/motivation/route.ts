import { NextResponse } from "next/server";
import { getMotivationStats } from "@/lib/garden";

export async function GET() {
  try {
    const stats = getMotivationStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch motivation stats" }, { status: 500 });
  }
}
