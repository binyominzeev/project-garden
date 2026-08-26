"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectStarToggleProps = {
  projectId: number;
  starred: boolean;
};

export function ProjectStarToggle({ projectId, starred }: ProjectStarToggleProps) {
  const router = useRouter();
  const [isStarred, setIsStarred] = useState(starred);
  const [saving, setSaving] = useState(false);

  async function toggleStar(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) return;

    const nextValue = !isStarred;
    setIsStarred(nextValue);
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: nextValue }),
      });

      if (!response.ok) {
        setIsStarred(!nextValue);
        throw new Error("Star update failed");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={isStarred ? "Kiemelés törlése" : "Projekt kiemelése"}
      aria-pressed={isStarred}
      onClick={toggleStar}
      className={`absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg leading-none transition ${
        isStarred
          ? "border-amber-300 bg-amber-100 text-amber-600 hover:bg-amber-200"
          : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-500"
      }`}
      disabled={saving}
    >
      {isStarred ? "★" : "☆"}
    </button>
  );
}
