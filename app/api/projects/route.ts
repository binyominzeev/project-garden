import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/garden";

export function GET() {
  return NextResponse.json(listProjects());
}

export async function POST(request: Request) {
  try {
    const project = createProject(await request.json());
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
