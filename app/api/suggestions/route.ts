import { NextResponse } from "next/server";
import { createSuggestion, listSuggestions } from "@/lib/garden";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(
    listSuggestions({
      q: searchParams.get("q") ?? "",
      tag: searchParams.get("tag") ?? "",
    }),
  );
}

export async function POST(request: Request) {
  try {
    const suggestion = createSuggestion(await request.json());
    return NextResponse.json(suggestion, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
