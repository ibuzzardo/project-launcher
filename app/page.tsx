import { LaunchForm } from "@/components/project-launcher/launch-form";
import { Card } from "@/components/ui/card";

export default function HomePage(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="glass-highlight pointer-events-none absolute inset-0" />
      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">Project Launcher</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/75">
            Launch builds instantly and monitor them in real time.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LaunchForm />
          </div>
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold">Realtime Build Tracking</h2>
              <p className="mt-2 text-sm text-foreground/75">
                Streaming logs and status updates over SSE with automatic recovery.
              </p>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">Validated API Flows</h2>
              <p className="mt-2 text-sm text-foreground/75">
                Zod validation and structured errors for reliable automation and UX.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
