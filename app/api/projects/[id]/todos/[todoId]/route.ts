import { NextResponse } from "next/server";
import { deleteProjectTodo, getProject, updateProjectTodoStatus } from "@/lib/garden";
import type { TodoStatus } from "@/lib/types";

type RouteParams = {
  params: { id: string; todoId: string };
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const project = getProject(params.id);
    const todoId = Number(params.todoId);

    if (!project || !Number.isFinite(todoId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const body = await request.json();
    const status = body.status as TodoStatus;

    const updated = updateProjectTodoStatus(project.id, todoId, status);
    if (!updated) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const project = getProject(params.id);
    const todoId = Number(params.todoId);

    if (!project || !Number.isFinite(todoId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const deleted = deleteProjectTodo(project.id, todoId);
    if (!deleted) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
