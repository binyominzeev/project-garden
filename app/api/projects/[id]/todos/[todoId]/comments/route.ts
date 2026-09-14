import { NextResponse } from "next/server";
import { createProjectTodoComment, getProject, getProjectTodoComments, getProjectTodo } from "@/lib/garden";

type RouteParams = {
  params: { id: string; todoId: string };
};

function getTodoContext(params: RouteParams["params"]) {
  const project = getProject(params.id);
  const todoId = Number(params.todoId);
  if (!project || !Number.isFinite(todoId)) return null;

  const todo = getProjectTodo(project.id, todoId);
  return todo ? { project, todo } : null;
}

export function GET(_request: Request, { params }: RouteParams) {
  const context = getTodoContext(params);
  if (!context) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json(getProjectTodoComments(context.todo.id));
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const context = getTodoContext(params);
    if (!context) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const body = await request.json();
    const comment = createProjectTodoComment(context.project.id, context.todo.id, body.body);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}