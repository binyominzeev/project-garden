import type { Metadata } from "next";
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
      <ProjectDetailClient detail={detail} projectOptions={listProjects()} />
    </main>
  );
}
