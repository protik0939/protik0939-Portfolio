import AnimatedBackgroundGlow from "@/Components/AnimatedBackgroundGlow";

export default function BlogDetailsLoading() {
  return (
    <div className="relative isolate overflow-x-hidden">
      <AnimatedBackgroundGlow />
      <main className="relative z-10 min-h-screen px-6 py-16 text-on-surface sm:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-8 flex items-center justify-between">
            <div className="h-9 w-28 rounded-full bg-surface-container-high" />
            <div className="h-9 w-24 rounded-full bg-surface-container-high" />
          </div>

          <div className="glass-panel overflow-hidden rounded-[2rem] border border-outline-variant/30">
            <div className="h-64 rounded-none bg-surface-container-high sm:h-80 lg:h-[26rem]" />
            <div className="p-6 sm:p-10">
              <div className="h-3 w-20 rounded-full bg-surface-container-high" />
              <div className="mt-4 h-12 w-3/4 rounded-2xl bg-surface-container-high" />
              <div className="mt-4 h-4 w-1/2 rounded-full bg-surface-container-high" />
              <div className="mt-8 h-4 w-full rounded-full bg-surface-container-high" />
              <div className="mt-3 h-4 w-11/12 rounded-full bg-surface-container-high" />
              <div className="mt-3 h-4 w-10/12 rounded-full bg-surface-container-high" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
