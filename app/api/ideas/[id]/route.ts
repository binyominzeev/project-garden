import { NextResponse } from "next/server";
import { deleteIdea, getIdea, updateIdea } from "@/lib/garden";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const idea = getIdea(Number(params.id));
  return idea
    ? NextResponse.json(idea)
    : NextResponse.json({ error: "Idea not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const idea = updateIdea(Number(params.id), await request.json());
  return idea
    ? NextResponse.json(idea)
    : NextResponse.json({ error: "Idea not found" }, { status: 404 });
}

export function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = deleteIdea(Number(params.id));
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Idea not found" }, { status: 404 });
}
