import type { Metadata } from "next";
import Link from "next/link";
import { listProjects } from "@/lib/garden";
import { statusLabel } from "@/lib/types";
import { ProjectStarToggle } from "@/components/project-star-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

const statuses = ["all", "active", "paused", "idea", "archived"] as const;

type ProjectsPageProps = {
  searchParams?: { status?: string };
};

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const requestedStatus = searchParams?.status;
  const activeStatus = statuses.includes((requestedStatus as typeof statuses[number]) ?? "all")
    ? (requestedStatus as typeof statuses[number] | undefined)
    : undefined;
  const projects = listProjects(activeStatus && activeStatus !== "all" ? activeStatus : undefined);

  return (
    <main className="shell space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-2 text-sm text-slate-600">All your active builds, paused experiments, and maybe-someday ideas in one sunny list.</p>
        </div>
        <Link href="/" className="button-secondary">
          Quick capture on home
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const isCurrent = (activeStatus ?? "all") === status || (!activeStatus && status === "all");
          return (
            <Link
              key={status}
              href={status === "all" ? "/projects" : `/projects?status=${status}`}
              className={isCurrent ? "button-primary" : "button-secondary"}
            >
              {status === "all" ? "All" : statusLabel.project[status]}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => {
          const total = project.todos_count?.total || 0;
          const done = project.todos_count?.done || 0;
          const working = project.todos_count?.working;
          const wantToWork = project.todos_count?.want_to_work;

          return (
            <div key={project.id} className="relative">
              <ProjectStarToggle projectId={project.id} starred={project.starred} />
              <Link href={`/projects/${project.slug}`} className="panel block p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{statusLabel.project[project.status]}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h2>
                    {working ? (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                        </span>
                        ⚡ Dolgozol rajta: {working}
                      </div>
                    ) : wantToWork ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        🎯 Fókusz: {wantToWork}
                      </div>
                    ) : project.description ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{project.description}</p>
                    ) : null}
                  </div>
                </div>

                {total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>TODO lista haladás</span>
                      <span>{done} / {total} kész ({Math.round((done / total) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${Math.round((done / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-slate-900">Aktuális lépés</p>
                    <p className="mt-1 line-clamp-1">{project.current_step || "Nincs megadva"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Legutóbb dolgoztál rajta</p>
                    <p className="mt-1">{project.last_worked_on ? new Date(project.last_worked_on).toLocaleDateString("hu-HU") : "Érintetlen"}</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-slate-600">No projects match that status yet.</div>
      ) : null}
    </main>
  );
}
