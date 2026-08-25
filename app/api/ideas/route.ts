import { NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/garden";

export function GET() {
  return NextResponse.json(listIdeas());
}

export async function POST(request: Request) {
  try {
    const idea = createIdea(await request.json());
    return NextResponse.json(idea, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
