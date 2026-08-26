"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MotivationStats } from "@/lib/types";

function formatHoursMinutes(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0 && mins === 0) return "0 perc";
  if (hrs === 0) return `${mins} perc`;
  return `${hrs} óra ${mins} perc`;
}

function formatTimeOnly(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

function formatDateOnly(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  } catch {
    return isoString;
  }
}

export function MotivationDashboard() {
  const [stats, setStats] = useState<MotivationStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const res = await fetch("/api/motivation");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    <div className="panel p-12 text-center text-slate-500">
      Adatok betöltése a Lelkesítő műszerfalhoz...
    </div>;
  }

  const {
    todayDurationSeconds = 0,
    weekDurationSeconds = 0,
    todayCompletedCount = 0,
    weekCompletedCount = 0,
    streakDays = 0,
    recentVictories = [],
    recentSessions = [],
  } = stats || {};

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block rounded-full bg-emerald-600/60 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
              🚀 Lelkesítő & Győzelmek
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Nézd meg, mi mindent értél el!
            </h1>
            <p className="mt-2 max-w-xl text-emerald-100 text-sm leading-relaxed">
              Minden apró előrelépés számít. Íme az elkötelezett munkád gyümölcse ma és a héten!
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-200 font-medium">
                Aktivitási Sorozat
              </p>
              <p className="text-2xl font-bold text-white">
                {streakDays} nap egymás után!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-6 border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ⏱️ Mai fókuszidő
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Ma
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {formatHoursMinutes(todayDurationSeconds)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ezen a héten összesen: <strong className="text-slate-700">{formatHoursMinutes(weekDurationSeconds)}</strong>
          </p>
        </div>

        <div className="panel p-6 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ✅ Mai mérföldkövek
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Befejezve
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {todayCompletedCount} <span className="text-lg font-normal text-slate-600">feladat</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Ezen a héten teljesítve: <strong className="text-slate-700">{weekCompletedCount} feladat</strong>
          </p>
        </div>

        <div className="panel p-6 border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              🏆 Munkamenetek
            </span>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              Összesítés
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {recentSessions.length} <span className="text-lg font-normal text-slate-600">alkalom</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Folyamatos lendület és fókuszált haladás.
          </p>
        </div>
      </div>

      {/* Victories & Timeline Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Victory Feed */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🎯</span> Befejezett Győzelmek
              </h2>
              <p className="text-xs text-slate-500">
                A legutóbb sikeresen lezárt és elvégzett feladatok
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {recentVictories.length} győzelem
            </span>
          </div>

          {recentVictories.length === 0 ? (
            <div className="py-8 text-center text-sm italic text-slate-500">
              Még nem jelöltél meg befejezett feladatot. Pipálj ki egyet a projekteknél! 🎉
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {recentVictories.map((victory) => (
                <div
                  key={victory.id}
                  className="group rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 transition hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        {victory.project_name || "Projekt"}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900">
                        {victory.title}
                      </h3>
                    </div>
                    <span className="rounded-xl bg-emerald-600 text-white px-2.5 py-1 text-xs font-bold shrink-0">
                      ✅ Kész
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-emerald-100/80 pt-2">
                    <span>
                      📅 {victory.completed_at ? `${formatDateOnly(victory.completed_at)} ${formatTimeOnly(victory.completed_at)}` : "Korábban"}
                    </span>
                    {victory.duration_seconds && victory.duration_seconds > 0 ? (
                      <span className="font-semibold text-slate-700">
                        ⏱️ Rászánt idő: {formatHoursMinutes(victory.duration_seconds)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Work Sessions Timeline */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>⏱️</span> Munkamenetek Idővonala
              </h2>
              <p className="text-xs text-slate-500">
                Mettől meddig és pontosan mennyit dolgoztál az egyes feladatokon
              </p>
            </div>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-8 text-center text-sm italic text-slate-500">
              Még nincsenek rögzített munkamenetek. Indítsd el a stopperórát egy feladatnál! ⚡
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {recentSessions.map((session) => {
                const isActive = !session.end_time;
                const dur = session.duration_seconds;

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl border p-4 transition ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {session.project_name || "Projekt"}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                          {session.todo_title || "Munka a projekten"}
                        </p>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                          <span className="h-2 w-2 animate-ping rounded-full bg-white"></span>
                          Épp folyamatban
                        </span>
                      ) : (
                        <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 shrink-0">
                          {formatHoursMinutes(dur)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                      <span>
                        🕒 {formatDateOnly(session.start_time)} {formatTimeOnly(session.start_time)}
                        {session.end_time ? ` – ${formatTimeOnly(session.end_time)}` : " (aktív)"}
                      </span>
                      {session.project_id ? (
                        <Link
                          href={`/projects/${session.project_slug || session.project_id}`}
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          Ugrás a projekthez →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
