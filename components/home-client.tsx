"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExperimentStatus, IdeaStatus, Project, ProjectStatus, SuggestionStatus } from "@/lib/types";
import { statusLabel } from "@/lib/types";

type CaptureType = "project" | "idea" | "suggestion" | "experiment";

type HomeClientProps = {
  initialRecommendations: Project[];
  projectOptions: Project[];
};

const captureConfig: Record<CaptureType, { title: string; endpoint: string; submitLabel: string }> = {
  project: { title: "Capture a project", endpoint: "/api/projects", submitLabel: "Save project" },
  idea: { title: "Capture an idea", endpoint: "/api/ideas", submitLabel: "Save idea" },
  suggestion: { title: "Capture a suggestion", endpoint: "/api/suggestions", submitLabel: "Save suggestion" },
  experiment: { title: "Capture an experiment", endpoint: "/api/experiments", submitLabel: "Save experiment" },
};

const projectDefaults = {
  name: "",
  description: "",
  status: "idea" as ProjectStatus,
  interest: "3",
  priority: "3",
  current_step: "",
  notes: "",
};

const itemDefaults = {
  title: "",
  description: "",
  project_id: "",
  status: "idea" as IdeaStatus | SuggestionStatus | ExperimentStatus,
  tags: "",
  outcome: "",
};

export function HomeClient({ initialRecommendations, projectOptions }: HomeClientProps) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [seenIds, setSeenIds] = useState(initialRecommendations.map((project) => project.id));
  const [captureType, setCaptureType] = useState<CaptureType | null>(null);
  const [projectForm, setProjectForm] = useState(projectDefaults);
  const [itemForm, setItemForm] = useState(itemDefaults);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const linkedProjectChoices = useMemo(
    () => projectOptions.filter((project) => project.status !== "archived"),
    [projectOptions],
  );

  async function refreshRecommendations() {
    setLoadingRecommendations(true);
    try {
      let response = await fetch(`/api/recommendations?exclude=${seenIds.join(",")}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load recommendations");
      }
      let data: Project[] = await response.json();

      if (data.length === 0) {
        response = await fetch("/api/recommendations", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load recommendations");
        data = await response.json();
      }

      setRecommendations(data);
      setSeenIds(data.map((project) => project.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function submitCapture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captureType) return;

    setSubmitting(true);
    try {
      const config = captureConfig[captureType];
      const payload =
        captureType === "project"
          ? {
              ...projectForm,
              interest: Number(projectForm.interest),
              priority: Number(projectForm.priority),
            }
          : {
              title: itemForm.title,
              description: itemForm.description,
              project_id: itemForm.project_id ? Number(itemForm.project_id) : null,
              status:
                captureType === "idea"
                  ? itemForm.status || "idea"
                  : captureType === "suggestion"
                    ? itemForm.status || "open"
                    : itemForm.status || "active",
              tags:
                captureType === "suggestion"
                  ? itemForm.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  : undefined,
              outcome: captureType === "experiment" ? itemForm.outcome : undefined,
            };

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const saved = await response.json();
      setCaptureType(null);
      setProjectForm(projectDefaults);
      setItemForm(itemDefaults);
      router.refresh();

      if (captureType === "project") {
        router.push(`/projects/${saved.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Recommended next</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Three things worth touching</h2>
          </div>
          <button type="button" className="button-secondary" onClick={refreshRecommendations} disabled={loadingRecommendations}>
            {loadingRecommendations ? "Refreshing..." : "Show me another 3"}
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {recommendations.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-5 transition hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{statusLabel.project[project.status]}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h3>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
                  {project.interest}/5 interest · {project.priority}/5 priority
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{project.description || "No description yet — maybe follow the thread and write one down."}</p>
              <div className="mt-4 grid gap-3 rounded-2xl bg-white/80 p-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-900">Current step</p>
                  <p className="mt-1">{project.current_step || "Pick the tiniest next move"}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Last worked on</p>
                  <p className="mt-1">{project.last_worked_on ? new Date(project.last_worked_on).toLocaleDateString() : "Needs its first session"}</p>
                </div>
              </div>
            </Link>
          ))}

          {recommendations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-emerald-900/10 px-6 py-10 text-center text-sm text-slate-600">
              You do not have any recommendable projects yet. Capture one to get started.
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Quick capture</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Catch it before it disappears</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A tiny inbox for projects, ideas, suggestions, and experiments.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(captureConfig) as CaptureType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCaptureType(type)}
              className={captureType === type ? "button-primary" : "button-secondary"}
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {captureType ? (
          <form className="mt-6 space-y-4" onSubmit={submitCapture}>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{captureConfig[captureType].title}</h3>
            </div>

            {captureType === "project" ? (
              <>
                <input
                  className="input"
                  placeholder="Project name"
                  value={projectForm.name}
                  onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
                <textarea
                  className="textarea"
                  placeholder="What is it about?"
                  value={projectForm.description}
                  onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <select className="select" value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="idea">Idea</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select className="select" value={projectForm.interest} onChange={(event) => setProjectForm((current) => ({ ...current, interest: event.target.value }))}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>Interest {value}</option>
                    ))}
                  </select>
                  <select className="select" value={projectForm.priority} onChange={(event) => setProjectForm((current) => ({ ...current, priority: event.target.value }))}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>Priority {value}</option>
                    ))}
                  </select>
                </div>
                <input
                  className="input"
                  placeholder="Current step"
                  value={projectForm.current_step}
                  onChange={(event) => setProjectForm((current) => ({ ...current, current_step: event.target.value }))}
                />
                <textarea
                  className="textarea"
                  placeholder="Anything else you want to remember"
                  value={projectForm.notes}
                  onChange={(event) => setProjectForm((current) => ({ ...current, notes: event.target.value }))}
                />
              </>
            ) : (
              <>
                <input
                  className="input"
                  placeholder={captureType === "idea" ? "Idea title" : captureType === "suggestion" ? "Suggestion title" : "Experiment title"}
                  value={itemForm.title}
                  onChange={(event) => setItemForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
                <textarea
                  className="textarea"
                  placeholder="Describe it a little"
                  value={itemForm.description}
                  onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))}
                />
                <select className="select" value={itemForm.project_id} onChange={(event) => setItemForm((current) => ({ ...current, project_id: event.target.value }))}>
                  <option value="">Not linked to a project yet</option>
                  {linkedProjectChoices.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {captureType === "idea" ? (
                  <select className="select" value={itemForm.status} onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value as IdeaStatus }))}>
                    <option value="idea">Idea</option>
                    <option value="linked">Linked</option>
                    <option value="converted">Converted</option>
                    <option value="discarded">Discarded</option>
                  </select>
                ) : null}
                {captureType === "suggestion" ? (
                  <>
                    <input
                      className="input"
                      placeholder="Tags, comma separated"
                      value={itemForm.tags}
                      onChange={(event) => setItemForm((current) => ({ ...current, tags: event.target.value }))}
                    />
                    <select className="select" value={itemForm.status} onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value as SuggestionStatus }))}>
                      <option value="open">Open</option>
                      <option value="done">Done</option>
                      <option value="discarded">Discarded</option>
                    </select>
                  </>
                ) : null}
                {captureType === "experiment" ? (
                  <>
                    <select className="select" value={itemForm.status} onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value as ExperimentStatus }))}>
                      <option value="active">Active</option>
                      <option value="promoted">Promoted</option>
                      <option value="kept_as_idea">Kept as idea</option>
                      <option value="postponed">Postponed</option>
                      <option value="discarded">Discarded</option>
                    </select>
                    <textarea
                      className="textarea"
                      placeholder="Outcome or learning"
                      value={itemForm.outcome}
                      onChange={(event) => setItemForm((current) => ({ ...current, outcome: event.target.value }))}
                    />
                  </>
                ) : null}
              </>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button-primary" disabled={submitting}>
                {submitting ? "Saving..." : captureConfig[captureType].submitLabel}
              </button>
              <button type="button" className="button-ghost" onClick={() => setCaptureType(null)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-emerald-900/10 px-5 py-10 text-center text-sm text-slate-600">
            Pick a capture type to open a lightweight form.
          </div>
        )}
      </section>
    </div>
  );
}
