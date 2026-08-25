import { NextResponse } from "next/server";
import { getProjectRecommendations } from "@/lib/garden";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  return NextResponse.json(getProjectRecommendations({ excludeIds: exclude }));
}
