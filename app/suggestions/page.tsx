import { SuggestionManager } from "@/components/suggestion-manager";
import { listProjects, listSuggestions } from "@/lib/garden";

export const dynamic = "force-dynamic";

type SuggestionsPageProps = {
  searchParams?: { q?: string; tag?: string };
};

export default function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const q = searchParams?.q ?? "";
  const tag = searchParams?.tag ?? "";

  return (
    <main className="shell space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Suggestions</h1>
        <p className="mt-2 text-sm text-slate-600">Helpful nudges, cleanup ideas, and quality-of-life improvements for your current projects.</p>
      </div>
      <SuggestionManager
        initialSuggestions={listSuggestions({ q, tag })}
        projectOptions={listProjects()}
        initialQuery={q}
        initialTag={tag}
      />
    </main>
  );
}
