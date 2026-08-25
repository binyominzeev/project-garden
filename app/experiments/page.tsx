import { ExperimentManager } from "@/components/experiment-manager";
import { listExperiments, listProjects } from "@/lib/garden";

export const dynamic = "force-dynamic";

export default function ExperimentsPage() {
  return (
    <main className="shell space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Experiments</h1>
        <p className="mt-2 text-sm text-slate-600">Short-lived prototypes, risky tests, and playful what-ifs that might grow into something real.</p>
      </div>
      <ExperimentManager initialExperiments={listExperiments()} projectOptions={listProjects()} />
    </main>
  );
}
