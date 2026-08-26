import type { Metadata } from "next";
import { MotivationDashboard } from "@/components/motivation-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Motivation",
};

export default function MotivationPage() {
  return (
    <main className="shell py-6">
      <MotivationDashboard />
    </main>
  );
}
