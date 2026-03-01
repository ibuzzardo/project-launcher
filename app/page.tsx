import { Card } from "@/components/ui/card";
import { LaunchForm } from "@/components/project-launcher/launch-form";

export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_35%)]" />
      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Project Launcher</h1>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">Launch builds instantly and monitor them in real time.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <LaunchForm />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h2 className="text-lg font-semibold">Realtime Build Tracking</h2>
              <p className="mt-2 text-sm text-slate-300">Streaming logs and status updates over SSE with automatic recovery.</p>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">Validated API Flows</h2>
              <p className="mt-2 text-sm text-slate-300">Zod validation and structured errors for reliable automation and UX.</p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
