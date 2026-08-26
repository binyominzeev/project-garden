import { NextResponse } from "next/server";
import { logProjectWork } from "@/lib/garden";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const project = logProjectWork(params.id, await request.json());
  return project
    ? NextResponse.json(project)
    : NextResponse.json({ error: "Project not found" }, { status: 404 });
}
