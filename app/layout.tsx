import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: "Project Garden",
    template: "%s – Project Garden",
  },
  description: "A calm little place to keep your projects, ideas, and experiments growing.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="mt-16 border-t border-slate-200/60 bg-[#f7f4ec]/60 py-8 text-slate-500">
          <div className="shell flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-base text-white shadow-sm">🌿</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Project Garden</p>
                <p className="text-xs text-slate-500">Tend your software life</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} Project Garden — Momentum counts more than perfection.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
