import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailClient } from "@/components/project-detail-client";
import { getProjectDetail, listProjects } from "@/lib/garden";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const detail = getProjectDetail(params.slug);
  if (!detail) {
    return { title: "Project Not Found" };
  }
  return {
    title: detail.project.name,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const detail = getProjectDetail(params.slug);

  if (!detail) {
    notFound();
  }

  if (params.slug !== detail.project.slug) {
    redirect(`/projects/${detail.project.slug}`);
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
