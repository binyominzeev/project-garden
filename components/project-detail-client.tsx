"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectDetail, ProjectStatus } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type ProjectDetailClientProps = {
  detail: ProjectDetail;
  projectOptions: Project[];
};

export function ProjectDetailClient({ detail, projectOptions }: ProjectDetailClientProps) {
  const router = useRouter();
  const [projectForm, setProjectForm] = useState({
    name: detail.project.name,
    description: detail.project.description,
    status: detail.project.status,
    interest: String(detail.project.interest),
    priority: String(detail.project.priority),
    last_worked_on: detail.project.last_worked_on ? detail.project.last_worked_on.slice(0, 10) : "",
    current_step: detail.project.current_step,
    notes: detail.project.notes,
  });
  const [logForm, setLogForm] = useState({ summary: "", nextStep: detail.project.current_step || "" });
  const [suggestionForm, setSuggestionForm] = useState({ title: "", description: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [logging, setLogging] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState(false);

  async function updateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${detail.project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          interest: Number(projectForm.interest),
          priority: Number(projectForm.priority),
          last_worked_on: projectForm.last_worked_on || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function logWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogging(true);
    try {
      const response = await fetch(`/api/projects/${detail.project.id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: logForm.summary,
          nextStep: logForm.nextStep,
        }),
      });

      if (!response.ok) {
        throw new Error("Log failed");
      }

      setLogForm({ summary: "", nextStep: logForm.nextStep });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLogging(false);
    }
  }

  async function addSuggestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingSuggestion(true);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestionForm.title,
          description: suggestionForm.description,
          project_id: detail.project.id,
          tags: suggestionForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          status: "open",
        }),
      });

      if (!response.ok) {
        throw new Error("Suggestion failed");
      }

      setSuggestionForm({ title: "", description: "", tags: "" });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setAddingSuggestion(false);
    }
  }

  async function deleteProject() {
    if (!window.confirm(`Delete ${detail.project.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${detail.project.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      router.push("/projects");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="panel p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{statusLabel.project[detail.project.status]}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{detail.project.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{detail.project.description || "No description yet."}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <div>Interest: {detail.project.interest}/5</div>
              <div>Priority: {detail.project.priority}/5</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Current step</p>
              <p className="mt-2 text-sm text-slate-600">{detail.project.current_step || "Not written yet"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Last worked on</p>
              <p className="mt-2 text-sm text-slate-600">{detail.project.last_worked_on ? new Date(detail.project.last_worked_on).toLocaleDateString() : "Not yet"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Linked items</p>
              <p className="mt-2 text-sm text-slate-600">
                {detail.ideas.length} ideas · {detail.suggestions.length} suggestions · {detail.experiments.length} experiments
              </p>
            </div>
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Edit project</h2>
              <p className="mt-2 text-sm text-slate-600">Keep the project record current without overthinking it.</p>
            </div>
            <button type="button" className="button-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={deleteProject}>
              Delete project
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={updateProject}>
            <input className="input" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} required />
            <textarea className="textarea" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <select className="select" value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="idea">Idea</option>
                <option value="archived">Archived</option>
              </select>
              <select className="select" value={projectForm.interest} onChange={(event) => setProjectForm((current) => ({ ...current, interest: event.target.value }))}>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Interest {value}</option>)}
              </select>
              <select className="select" value={projectForm.priority} onChange={(event) => setProjectForm((current) => ({ ...current, priority: event.target.value }))}>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Priority {value}</option>)}
              </select>
              <input className="input" type="date" value={projectForm.last_worked_on} onChange={(event) => setProjectForm((current) => ({ ...current, last_worked_on: event.target.value }))} />
            </div>
            <input className="input" placeholder="Current step" value={projectForm.current_step} onChange={(event) => setProjectForm((current) => ({ ...current, current_step: event.target.value }))} />
            <textarea className="textarea" placeholder="Notes" value={projectForm.notes} onChange={(event) => setProjectForm((current) => ({ ...current, notes: event.target.value }))} />
            <button type="submit" className="button-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </form>
        </section>

        <section className="panel p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Work log</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">What did you do, and what&apos;s next?</h2>
          </div>
          <form className="mt-6 space-y-4" onSubmit={logWork}>
            <textarea
              className="textarea"
              placeholder="What did you do?"
              value={logForm.summary}
              onChange={(event) => setLogForm((current) => ({ ...current, summary: event.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="What's the next step?"
              value={logForm.nextStep}
              onChange={(event) => setLogForm((current) => ({ ...current, nextStep: event.target.value }))}
              required
            />
            <button type="submit" className="button-primary" disabled={logging}>{logging ? "Logging..." : "Log work"}</button>
          </form>
        </section>
      </div>

      <div className="space-y-6">
        <section className="panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Add a linked suggestion</h2>
          <p className="mt-2 text-sm text-slate-600">Capture improvements while the project context is fresh.</p>
          <form className="mt-6 space-y-4" onSubmit={addSuggestion}>
            <input className="input" placeholder="Suggestion title" value={suggestionForm.title} onChange={(event) => setSuggestionForm((current) => ({ ...current, title: event.target.value }))} required />
            <textarea className="textarea" placeholder="Why would this help?" value={suggestionForm.description} onChange={(event) => setSuggestionForm((current) => ({ ...current, description: event.target.value }))} />
            <input className="input" placeholder="Tags, comma separated" value={suggestionForm.tags} onChange={(event) => setSuggestionForm((current) => ({ ...current, tags: event.target.value }))} />
            <button type="submit" className="button-primary" disabled={addingSuggestion}>{addingSuggestion ? "Saving..." : "Add suggestion"}</button>
          </form>
        </section>

        <LinkedSection
          title="Linked ideas"
          empty="No ideas linked yet."
          items={detail.ideas.map((idea) => ({
            id: idea.id,
            title: idea.title,
            meta: statusLabel.idea[idea.status],
            description: idea.description,
          }))}
        />
        <LinkedSection
          title="Linked suggestions"
          empty="No suggestions linked yet."
          items={detail.suggestions.map((suggestion) => ({
            id: suggestion.id,
            title: suggestion.title,
            meta: `${statusLabel.suggestion[suggestion.status]}${suggestion.tags.length ? ` · ${suggestion.tags.join(", ")}` : ""}`,
            description: suggestion.description,
          }))}
        />
        <LinkedSection
          title="Linked experiments"
          empty="No experiments linked yet."
          items={detail.experiments.map((experiment) => ({
            id: experiment.id,
            title: experiment.title,
            meta: statusLabel.experiment[experiment.status],
            description: experiment.outcome || experiment.description,
          }))}
        />

        <section className="panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Other project slots</h2>
          <p className="mt-2 text-sm text-slate-600">Useful when you want to quickly relink items elsewhere.</p>
          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            {projectOptions.map((project) => (
              <div key={project.id} className="rounded-2xl bg-white px-3 py-2">
                <div className="font-medium text-slate-900">{project.name}</div>
                <div>{statusLabel.project[project.status]}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

type LinkedSectionProps = {
  title: string;
  empty: string;
  items: Array<{ id: number; title: string; meta: string; description: string }>;
};

function LinkedSection({ title, empty, items }: LinkedSectionProps) {
  return (
    <section className="panel p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">{empty}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">{item.meta}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description || "No extra notes yet."}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
