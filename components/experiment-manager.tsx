"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Experiment, ExperimentStatus, Project } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type ExperimentManagerProps = {
  initialExperiments: Experiment[];
  projectOptions: Project[];
};

export function ExperimentManager({ initialExperiments, projectOptions }: ExperimentManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", project_id: "", status: "active" as ExperimentStatus, outcome: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState({ title: "", description: "", project_id: "", status: "active" as ExperimentStatus, outcome: "" });
  const [saving, setSaving] = useState(false);

  async function createExperiment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          project_id: form.project_id ? Number(form.project_id) : null,
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      setForm({ title: "", description: "", project_id: "", status: "active", outcome: "" });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(experiment: Experiment) {
    setEditingId(experiment.id);
    setEditingForm({
      title: experiment.title,
      description: experiment.description,
      project_id: experiment.project_id ? String(experiment.project_id) : "",
      status: experiment.status,
      outcome: experiment.outcome,
    });
  }

  async function saveExperiment(id: number) {
    try {
      const response = await fetch(`/api/experiments/${id}`, {
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

  async function removeExperiment(id: number) {
    try {
      const response = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">New experiment</h2>
        <form className="mt-6 space-y-4" onSubmit={createExperiment}>
          <input className="input" placeholder="Experiment title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <textarea className="textarea" placeholder="What are you testing?" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <select className="select" value={form.project_id} onChange={(event) => setForm((current) => ({ ...current, project_id: event.target.value }))}>
            <option value="">Not linked to a project</option>
            {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select className="select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ExperimentStatus }))}>
            <option value="active">Active</option>
            <option value="promoted">Promoted</option>
            <option value="kept_as_idea">Kept as idea</option>
            <option value="postponed">Postponed</option>
            <option value="discarded">Discarded</option>
          </select>
          <textarea className="textarea" placeholder="Outcome or learning" value={form.outcome} onChange={(event) => setForm((current) => ({ ...current, outcome: event.target.value }))} />
          <button type="submit" className="button-primary" disabled={saving}>{saving ? "Saving..." : "Save experiment"}</button>
        </form>
      </section>

      <section className="space-y-4">
        {initialExperiments.map((experiment) => (
          <article key={experiment.id} className="panel p-6">
            {editingId === experiment.id ? (
              <div className="space-y-4">
                <input className="input" value={editingForm.title} onChange={(event) => setEditingForm((current) => ({ ...current, title: event.target.value }))} />
                <textarea className="textarea" value={editingForm.description} onChange={(event) => setEditingForm((current) => ({ ...current, description: event.target.value }))} />
                <select className="select" value={editingForm.project_id} onChange={(event) => setEditingForm((current) => ({ ...current, project_id: event.target.value }))}>
                  <option value="">Not linked to a project</option>
                  {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <select className="select" value={editingForm.status} onChange={(event) => setEditingForm((current) => ({ ...current, status: event.target.value as ExperimentStatus }))}>
                  <option value="active">Active</option>
                  <option value="promoted">Promoted</option>
                  <option value="kept_as_idea">Kept as idea</option>
                  <option value="postponed">Postponed</option>
                  <option value="discarded">Discarded</option>
                </select>
                <textarea className="textarea" value={editingForm.outcome} onChange={(event) => setEditingForm((current) => ({ ...current, outcome: event.target.value }))} />
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="button-primary" onClick={() => saveExperiment(experiment.id)}>Save</button>
                  <button type="button" className="button-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-800">{statusLabel.experiment[experiment.status]}</span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{experiment.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="button-ghost" onClick={() => startEditing(experiment)}>Edit</button>
                    <button type="button" className="button-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => removeExperiment(experiment.id)}>Delete</button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{experiment.description || "No description yet."}</p>
                {experiment.outcome ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{experiment.outcome}</p> : null}
                <p className="mt-4 text-sm text-slate-500">{experiment.project_name ? `Linked to ${experiment.project_name}` : "Not linked to a project yet"}</p>
              </>
            )}
          </article>
        ))}
        {initialExperiments.length === 0 ? <div className="panel p-8 text-center text-sm text-slate-600">No experiments yet.</div> : null}
      </section>
    </div>
  );
}
