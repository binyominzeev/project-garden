import { NextResponse } from "next/server";
import { getProjectRecommendations } from "@/lib/garden";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return NextResponse.json(getProjectRecommendations({ excludeIds: exclude }));
}
