import { HomeClient } from "@/components/home-client";
import { getProjectRecommendations, listProjects } from "@/lib/garden";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const recommendations = getProjectRecommendations();
  const projects = listProjects();

  return (
    <main className="shell space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="panel overflow-hidden p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Project Garden
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                What should you work on today?
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Pick something that feels alive again. Project Garden surfaces the most promising next moves across your software ideas, side quests, and experiments.
              </p>
            </div>
          </div>
        </div>
        <div className="panel p-8">
          <h2 className="text-lg font-semibold text-slate-900">A tiny ritual</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Choose one thing, log what you did, and leave your future self a friendly next step. Momentum counts more than perfection.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-amber-50 px-4 py-3">🌱 Start with the project that feels both exciting and doable.</div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3">📝 Capture loose thoughts before they drift away.</div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">🔁 Leave a clear next step so tomorrow starts easier.</div>
          </div>
        </div>
      </section>

      <HomeClient initialRecommendations={recommendations} projectOptions={projects} />
    </main>
  );
}
