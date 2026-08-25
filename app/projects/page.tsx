import Link from "next/link";
import { listProjects } from "@/lib/garden";
import { statusLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

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
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="panel block p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{statusLabel.project[project.status]}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{project.description || "No description yet — maybe the next step is to define the shape of this idea."}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right text-xs font-medium text-emerald-800">
                <div>Interest {project.interest}/5</div>
                <div>Priority {project.priority}/5</div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-medium text-slate-900">Current step</p>
                <p className="mt-1">{project.current_step || "Not written yet"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Last worked on</p>
                <p className="mt-1">{project.last_worked_on ? new Date(project.last_worked_on).toLocaleDateString() : "Fresh or untouched"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-slate-600">No projects match that status yet.</div>
      ) : null}
    </main>
  );
}
