import { IdeaManager } from "@/components/idea-manager";
import { listIdeas, listProjects } from "@/lib/garden";

export const dynamic = "force-dynamic";

export default function IdeasPage() {
  return (
    <main className="shell space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Ideas</h1>
        <p className="mt-2 text-sm text-slate-600">Loose sparks, future features, and maybe-later rabbit holes — kept somewhere safe.</p>
      </div>
      <IdeaManager initialIdeas={listIdeas()} projectOptions={listProjects()} />
    </main>
  );
}
