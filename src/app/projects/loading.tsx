import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";

export default function ProjectsLoading() {
  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <section className="glass-panel mb-12 rounded-[2rem] border border-outline-variant/30 p-8 md:p-12">
            <div className="h-4 w-24 rounded-full bg-surface-container-high" />
            <div className="mt-4 h-12 w-72 rounded-2xl bg-surface-container-high" />
            <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-surface-container-high" />
          </section>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-panel rounded-3xl border border-outline-variant/30 p-4">
                <div className="h-48 rounded-2xl bg-surface-container-high" />
                <div className="mt-4 h-4 w-2/3 rounded-full bg-surface-container-high" />
                <div className="mt-3 h-3 w-full rounded-full bg-surface-container-high" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
