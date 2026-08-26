import { NextResponse } from "next/server";
import { createProjectTodo, getProject, getProjectTodos } from "@/lib/garden";

type RouteParams = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const project = getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const todos = getProjectTodos(project.id);
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const project = getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const todo = createProjectTodo(project.id, body.title);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to create todo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
