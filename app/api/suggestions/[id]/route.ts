import { NextResponse } from "next/server";
import { deleteSuggestion, getSuggestion, updateSuggestion } from "@/lib/garden";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const suggestion = getSuggestion(Number(params.id));
  return suggestion
    ? NextResponse.json(suggestion)
    : NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const suggestion = updateSuggestion(Number(params.id), await request.json());
  return suggestion
    ? NextResponse.json(suggestion)
    : NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
}

export function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = deleteSuggestion(Number(params.id));
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
}
