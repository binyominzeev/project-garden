import { NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/garden";

export function GET() {
  return NextResponse.json(listIdeas());
}

export async function POST(request: Request) {
  const idea = createIdea(await request.json());
  return NextResponse.json(idea, { status: 201 });
}
