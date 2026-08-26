import { NextResponse } from "next/server";
import { deleteProject, getProject, updateProject } from "@/lib/garden";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const project = getProject(params.id);
  return project
    ? NextResponse.json(project)
    : NextResponse.json({ error: "Project not found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const project = updateProject(params.id, await request.json());
  return project
    ? NextResponse.json(project)
    : NextResponse.json({ error: "Project not found" }, { status: 404 });
}

export function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = deleteProject(params.id);
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Project not found" }, { status: 404 });
}
