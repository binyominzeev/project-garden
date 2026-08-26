"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectTodo, TodoStatus, WorkSession } from "@/lib/types";

type ProjectTodoManagerProps = {
  projectId: number;
  todos: ProjectTodo[];
  activeSession: WorkSession | null;
};

function triggerConfetti() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    if (canvas.parentNode) document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#f43f5e"];
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vr: number;
  }> = [];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height / 3 + (Math.random() - 0.5) * 100,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
    });
  }

  const startTime = Date.now();

  function render() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > 2500) {
      if (canvas.parentNode) document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.vr;

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - elapsed / 2500);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();
}

export function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}ó ${mins}p ${secs}s`;
  }
  return `${mins}p ${secs}s`;
}

function formatTimer(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function ProjectTodoManager({ projectId, todos, activeSession }: ProjectTodoManagerProps) {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const workingTodo = todos.find((t) => t.status === "working");

  // Timer loop for active session / working todo
  useEffect(() => {
    if (!activeSession && !workingTodo) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = activeSession ? new Date(activeSession.start_time).getTime() : Date.now();

    function updateTimer() {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diff);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, workingTodo]);

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setNewTitle("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  async function handleSetStatus(todoId: number, newStatus: TodoStatus) {
    setUpdatingId(todoId);
    try {
      const res = await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === "done") {
          triggerConfetti();
          const todo = todos.find((t) => t.id === todoId);
          setCelebrationMessage(`🎉 Szép munka! Befejezted: "${todo?.title || "Feladat"}"`);
          setTimeout(() => setCelebrationMessage(null), 4000);
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteTodo(todoId: number) {
    if (!window.confirm("Biztosan törlöd ezt a feladatot?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStopWorkSession() {
    try {
      const res = await fetch("/api/work-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const doneCount = todos.filter((t) => t.status === "done").length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast celebration message */}
      {celebrationMessage ? (
        <div className="animate-bounce rounded-2xl bg-emerald-600 p-4 text-center font-medium text-white shadow-lg">
          {celebrationMessage}
        </div>
      ) : null}

      {/* Active Timer Bar */}
      {(workingTodo || activeSession) && (
        <div className="panel border-2 border-emerald-500 bg-emerald-50/80 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-600"></span>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Most ezen dolgozol
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {workingTodo ? workingTodo.title : activeSession?.todo_title || "Aktív munka"}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-900 px-4 py-2 font-mono text-xl font-bold tracking-wider text-emerald-400 shadow-inner">
                ⚡ {formatTimer(elapsedSeconds)}
              </div>
              <div className="flex gap-2">
                {workingTodo && (
                  <button
                    onClick={() => handleSetStatus(workingTodo.id, "done")}
                    className="button-primary bg-emerald-700 hover:bg-emerald-800 text-sm"
                  >
                    ✅ Befejezés
                  </button>
                )}
                <button
                  onClick={handleStopWorkSession}
                  className="button-secondary text-sm"
                >
                  ⏸️ Szünet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TODO List Panel */}
      <div className="panel p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Projekthez tartozó TODO Lista</h2>
            <p className="text-sm text-slate-600">
              Jelöld ki, amin dolgozni szeretnél, vagy indítsd el a stopperórát!
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-semibold text-emerald-800">
              {doneCount} / {totalCount} kész ({progressPercent}%)
            </span>
            <div className="mt-1 h-2 w-36 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <input
            type="text"
            placeholder="Új feladat megadása..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input flex-1"
          />
          <button type="submit" disabled={adding || !newTitle.trim()} className="button-primary">
            + Hozzáadás
          </button>
        </form>

        {/* Todo Items */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-slate-500">
              Még nincsenek feladatok a projekthez. Írj be egyet fent!
            </p>
          ) : (
            todos.map((todo) => {
              const isUpdating = updatingId === todo.id;
              const isWorking = todo.status === "working";
              const isWantToWork = todo.status === "want_to_work";
              const isDone = todo.status === "done";

              return (
                <div
                  key={todo.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 transition ${
                    isWorking
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                      : isWantToWork
                      ? "border-amber-400 bg-amber-50/40"
                      : isDone
                      ? "border-slate-200 bg-slate-50/60 opacity-75"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p
                        className={`text-base font-medium ${
                          isDone ? "text-slate-500 line-through" : "text-slate-900"
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.completed_at ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Befejezve: {new Date(todo.completed_at).toLocaleString("hu-HU")}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-xs text-slate-400 hover:text-red-600"
                      title="Feladat törlése"
                    >
                      Törlés
                    </button>
                  </div>

                  {/* Action status buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetStatus(todo.id, "todo")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        todo.status === "todo"
                          ? "bg-slate-200 text-slate-800 shadow-inner"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      📋 Várakozik
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetStatus(todo.id, "want_to_work")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        isWantToWork
                          ? "bg-amber-200 text-amber-900 font-semibold shadow-inner"
                          : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      🎯 Ezen akarok dolgozni
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetStatus(todo.id, "working")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        isWorking
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      ⚡ Ezen dolgozom (Stopper)
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetStatus(todo.id, isDone ? "todo" : "done")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        isDone
                          ? "bg-emerald-700 text-white font-semibold"
                          : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                      }`}
                    >
                      {isDone ? "✅ Ez már készen van!" : "✅ Jelölés késznek"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
