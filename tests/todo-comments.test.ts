import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { TODO_COMMENT_MAX_LENGTH } from "../lib/todo-comments";

test("comment API preserves multiline text and enforces the full length limit", async (t) => {
  const originalDirectory = process.cwd();
  const databaseDirectory = mkdtempSync(path.join(tmpdir(), "garden-comments-test-"));
  process.chdir(databaseDirectory);
  let closeDatabase: (() => void) | undefined;
  t.after(() => {
    closeDatabase?.();
    process.chdir(originalDirectory);
    rmSync(databaseDirectory, { recursive: true });
  });
  const { default: db } = await import("../lib/db");
  closeDatabase = () => db.close();
  const { createProject, createProjectTodo, getProjectTodoComments } = await import("../lib/garden");
  const { GET, POST } = await import("../app/api/projects/[id]/todos/[todoId]/comments/route");
  const project = createProject({ name: "Comment test" });
  const todo = createProjectTodo(project.id, "Test todo");
  const params = { id: String(project.id), todoId: String(todo.id) };
  const post = (body: unknown) => POST(new Request("http://localhost/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  }), { params });

  const text = `\nFirst line\n\n${"x".repeat(TODO_COMMENT_MAX_LENGTH - 14)}\n`;
  assert.equal(text.length, TODO_COMMENT_MAX_LENGTH);
  const created = await post(text);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).body, text);

  const fetched = await GET(new Request("http://localhost/comments"), { params });
  assert.equal(fetched.status, 200);
  assert.equal((await fetched.json())[0].body, text);

  assert.equal((await post("x".repeat(TODO_COMMENT_MAX_LENGTH + 1))).status, 400);
  assert.equal((await post("\n  \n")).status, 400);
  assert.equal((await post(42)).status, 400);
  assert.equal(getProjectTodoComments(todo.id).length, 1);
});
