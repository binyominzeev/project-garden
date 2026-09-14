import { NextResponse } from "next/server";
import { deleteProjectTodoComment, getProject, getProjectTodo } from "@/lib/garden";

type RouteParams = {
  params: { id: string; todoId: string; commentId: string };
};

export function DELETE(_request: Request, { params }: RouteParams) {
  const project = getProject(params.id);
  const todoId = Number(params.todoId);
  const commentId = Number(params.commentId);

  if (!project || !Number.isFinite(todoId) || !Number.isFinite(commentId) || !getProjectTodo(project.id, todoId)) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const deleted = deleteProjectTodoComment(project.id, todoId, commentId);
  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Comment not found" }, { status: 404 });
}