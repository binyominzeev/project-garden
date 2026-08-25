import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/project-detail-client";
import { getProjectDetail, listProjects } from "@/lib/garden";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: { id: string };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  const detail = getProjectDetail(Number(params.id));

  if (!detail) {
    notFound();
  }

  return (
    <main className="shell space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/projects" className="button-ghost">
          ← Back to projects
        </Link>
        <Link href="/" className="button-secondary">
          Home recommendations
        </Link>
      </div>
      <ProjectDetailClient detail={detail} projectOptions={listProjects()} />
    </main>
  );
}
