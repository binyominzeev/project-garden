"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Idea, IdeaStatus, Project } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type IdeaManagerProps = {
  initialIdeas: Idea[];
  projectOptions: Project[];
};

export function IdeaManager({ initialIdeas, projectOptions }: IdeaManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", project_id: "", status: "idea" as IdeaStatus });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState({ title: "", description: "", project_id: "", status: "idea" as IdeaStatus });

  async function createIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          project_id: form.project_id ? Number(form.project_id) : null,
        }),
      });

      if (!response.ok) throw new Error("Create failed");
      setForm({ title: "", description: "", project_id: "", status: "idea" });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(idea: Idea) {
    setEditingId(idea.id);
    setEditingForm({
      title: idea.title,
      description: idea.description,
      project_id: idea.project_id ? String(idea.project_id) : "",
      status: idea.status,
    });
  }

  async function saveIdea(id: number) {
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingForm,
          project_id: editingForm.project_id ? Number(editingForm.project_id) : null,
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeIdea(id: number) {
    try {
      const response = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">New idea</h2>
        <form className="mt-6 space-y-4" onSubmit={createIdea}>
          <input className="input" placeholder="Idea title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <textarea className="textarea" placeholder="Describe the spark" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <select className="select" value={form.project_id} onChange={(event) => setForm((current) => ({ ...current, project_id: event.target.value }))}>
            <option value="">Not linked to a project</option>
            {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select className="select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as IdeaStatus }))}>
            <option value="idea">Idea</option>
            <option value="linked">Linked</option>
            <option value="converted">Converted</option>
            <option value="discarded">Discarded</option>
          </select>
          <button type="submit" className="button-primary" disabled={submitting}>{submitting ? "Saving..." : "Save idea"}</button>
        </form>
      </section>

      <section className="space-y-4">
        {initialIdeas.map((idea) => (
          <article key={idea.id} className="panel p-6">
            {editingId === idea.id ? (
              <div className="space-y-4">
                <input className="input" value={editingForm.title} onChange={(event) => setEditingForm((current) => ({ ...current, title: event.target.value }))} />
                <textarea className="textarea" value={editingForm.description} onChange={(event) => setEditingForm((current) => ({ ...current, description: event.target.value }))} />
                <select className="select" value={editingForm.project_id} onChange={(event) => setEditingForm((current) => ({ ...current, project_id: event.target.value }))}>
                  <option value="">Not linked to a project</option>
                  {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <select className="select" value={editingForm.status} onChange={(event) => setEditingForm((current) => ({ ...current, status: event.target.value as IdeaStatus }))}>
                  <option value="idea">Idea</option>
                  <option value="linked">Linked</option>
                  <option value="converted">Converted</option>
                  <option value="discarded">Discarded</option>
                </select>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="button-primary" onClick={() => saveIdea(idea.id)}>Save</button>
                  <button type="button" className="button-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">{statusLabel.idea[idea.status]}</span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{idea.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="button-ghost" onClick={() => startEditing(idea)}>Edit</button>
                    <button type="button" className="button-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => removeIdea(idea.id)}>Delete</button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{idea.description || "No description yet."}</p>
                <p className="mt-4 text-sm text-slate-500">
                  {idea.project_name ? `Linked to ${idea.project_name}` : "Not linked to a project yet"}
                </p>
              </>
            )}
          </article>
        ))}

        {initialIdeas.length === 0 ? <div className="panel p-8 text-center text-sm text-slate-600">No ideas saved yet.</div> : null}
      </section>
    </div>
  );
}
