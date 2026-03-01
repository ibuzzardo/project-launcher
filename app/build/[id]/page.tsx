import { notFound } from "next/navigation";

import { BuildStatusClient } from "@/components/project-launcher/build-status-client";
import { inMemoryProjectStore } from "@/lib/store/in-memory-project-store";

interface PageProps {
  params: { id: string };
}

export default async function BuildStatusPage({ params }: PageProps): Promise<JSX.Element> {
  try {
    const build = inMemoryProjectStore.getBuild(params.id);
    if (!build) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(167,139,250,0.14),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.16),transparent_40%)]" />
        <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Build Status</h1>
              <p className="text-sm text-slate-300 mt-1">Live updates from server-sent events.</p>
            </div>
          </header>

          <BuildStatusClient initialBuild={build} />
        </main>
      </div>
    );
  } catch {
    notFound();
  }
}
