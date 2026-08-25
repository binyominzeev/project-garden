import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/garden";

export function GET() {
  return NextResponse.json(listProjects());
}

export async function POST(request: Request) {
  const body = await request.json();
  const project = createProject(body);
  return NextResponse.json(project, { status: 201 });
}
