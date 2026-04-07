import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";

export default function Loading() {
  return (
    <div className="relative isolate overflow-hidden text-on-surface">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen overflow-hidden">
        <div className="animate-pulse">
        <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-outline-variant/30 bg-linear-to-b from-background/85 to-background/35 px-8 backdrop-blur-lg">
          <div className="h-6 w-44 rounded-full bg-surface-container-high" />
          <div className="hidden gap-4 md:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 w-16 rounded-full bg-surface-container-high" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-14 rounded-full bg-surface-container-high" />
            <div className="h-10 w-10 rounded-full bg-surface-container-high" />
            <div className="h-10 w-28 rounded-full bg-surface-container-high" />
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-24 px-8 pt-32 pb-20">
          <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="h-4 w-32 rounded-full bg-surface-container" />
              <div className="h-20 w-4/5 rounded-3xl bg-surface-container" />
              <div className="h-6 w-3/5 rounded-full bg-surface-container" />
              <div className="h-6 w-4/5 rounded-full bg-surface-container" />
              <div className="flex gap-4 pt-2">
                <div className="h-12 w-40 rounded-full bg-primary/30" />
                <div className="h-12 w-44 rounded-full bg-surface-container" />
              </div>
            </div>
            <div className="glass-panel aspect-4/5 rounded-3xl border border-outline-variant/30 bg-surface-container p-4">
              <div className="h-full w-full rounded-2xl bg-surface-container-high" />
            </div>
          </section>

          <section className="space-y-8">
            <div className="mx-auto h-8 w-64 rounded-full bg-surface-container" />
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-56 rounded-3xl border border-outline-variant/30 bg-surface-container-low" />
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="h-10 w-72 rounded-full bg-surface-container" />
            <div className="space-y-10">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                  <div className="aspect-video rounded-3xl border border-outline-variant/30 bg-surface-container" />
                  <div className="space-y-4">
                    <div className="h-4 w-28 rounded-full bg-surface-container" />
                    <div className="h-8 w-3/4 rounded-full bg-surface-container" />
                    <div className="h-4 w-full rounded-full bg-surface-container" />
                    <div className="h-4 w-5/6 rounded-full bg-surface-container" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        </div>
      </main>
    </div>
  );
}
