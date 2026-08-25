import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <div className="panel p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Lost in the garden?</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">That page doesn&apos;t exist.</h1>
        <p className="mt-3 text-sm text-slate-600">Try heading back to your home dashboard or the project list.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="button-primary">Go home</Link>
          <Link href="/projects" className="button-secondary">View projects</Link>
        </div>
      </div>
    </main>
  );
}
