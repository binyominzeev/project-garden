"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, Suggestion, SuggestionStatus } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type SuggestionManagerProps = {
  initialSuggestions: Suggestion[];
  projectOptions: Project[];
  initialQuery: string;
  initialTag: string;
};

export function SuggestionManager({ initialSuggestions, projectOptions, initialQuery, initialTag }: SuggestionManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", project_id: "", tags: "", status: "open" as SuggestionStatus });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState({ title: "", description: "", project_id: "", tags: "", status: "open" as SuggestionStatus });
  const [saving, setSaving] = useState(false);

  async function createSuggestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          project_id: form.project_id ? Number(form.project_id) : null,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      setForm({ title: "", description: "", project_id: "", tags: "", status: "open" });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(suggestion: Suggestion) {
    setEditingId(suggestion.id);
    setEditingForm({
      title: suggestion.title,
      description: suggestion.description,
      project_id: suggestion.project_id ? String(suggestion.project_id) : "",
      tags: suggestion.tags.join(", "),
      status: suggestion.status,
    });
  }

  async function saveSuggestion(id: number) {
    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingForm,
          project_id: editingForm.project_id ? Number(editingForm.project_id) : null,
          tags: editingForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Update failed");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeSuggestion(id: number) {
    try {
      const response = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8">
        <form action="/suggestions" className="grid gap-4 lg:grid-cols-[1fr_0.7fr_auto]">
          <input name="q" defaultValue={initialQuery} className="input" placeholder="Search suggestions" />
          <input name="tag" defaultValue={initialTag} className="input" placeholder="Filter by tag" />
          <button type="submit" className="button-secondary">Apply filters</button>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">New suggestion</h2>
          <form className="mt-6 space-y-4" onSubmit={createSuggestion}>
            <input className="input" placeholder="Suggestion title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
            <textarea className="textarea" placeholder="What would improve?" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <select className="select" value={form.project_id} onChange={(event) => setForm((current) => ({ ...current, project_id: event.target.value }))}>
              <option value="">Not linked to a project</option>
              {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <input className="input" placeholder="Tags, comma separated" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            <select className="select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SuggestionStatus }))}>
              <option value="open">Open</option>
              <option value="done">Done</option>
              <option value="discarded">Discarded</option>
            </select>
            <button type="submit" className="button-primary" disabled={saving}>{saving ? "Saving..." : "Save suggestion"}</button>
          </form>
        </section>

        <section className="space-y-4">
          {initialSuggestions.map((suggestion) => (
            <article key={suggestion.id} className="panel p-6">
              {editingId === suggestion.id ? (
                <div className="space-y-4">
                  <input className="input" value={editingForm.title} onChange={(event) => setEditingForm((current) => ({ ...current, title: event.target.value }))} />
                  <textarea className="textarea" value={editingForm.description} onChange={(event) => setEditingForm((current) => ({ ...current, description: event.target.value }))} />
                  <select className="select" value={editingForm.project_id} onChange={(event) => setEditingForm((current) => ({ ...current, project_id: event.target.value }))}>
                    <option value="">Not linked to a project</option>
                    {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                  <input className="input" value={editingForm.tags} onChange={(event) => setEditingForm((current) => ({ ...current, tags: event.target.value }))} />
                  <select className="select" value={editingForm.status} onChange={(event) => setEditingForm((current) => ({ ...current, status: event.target.value as SuggestionStatus }))}>
                    <option value="open">Open</option>
                    <option value="done">Done</option>
                    <option value="discarded">Discarded</option>
                  </select>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="button-primary" onClick={() => saveSuggestion(suggestion.id)}>Save</button>
                    <button type="button" className="button-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-800">{statusLabel.suggestion[suggestion.status]}</span>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{suggestion.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="button-ghost" onClick={() => startEditing(suggestion)}>Edit</button>
                      <button type="button" className="button-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => removeSuggestion(suggestion.id)}>Delete</button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{suggestion.description || "No description yet."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">#{tag}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{suggestion.project_name ? `Linked to ${suggestion.project_name}` : "Not linked to a project yet"}</p>
                </>
              )}
            </article>
          ))}
          {initialSuggestions.length === 0 ? <div className="panel p-8 text-center text-sm text-slate-600">No suggestions match those filters yet.</div> : null}
        </section>
      </div>
    </div>
  );
}
