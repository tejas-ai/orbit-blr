export default function Loading() {
  return (
    <div role="status" aria-label="Loading events" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-10 w-2/3 max-w-lg rounded-xl bg-slate-100 dark:bg-[#242034]" />
      <div className="mt-4 h-5 w-1/2 max-w-sm rounded-lg bg-slate-100 dark:bg-[#242034]" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 dark:border-[#302B43]">
            <div className="aspect-video bg-slate-100 dark:bg-[#242034]" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-[#242034]" />
              <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-[#242034]" />
              <div className="h-8 w-2/5 rounded-full bg-slate-100 dark:bg-[#242034]" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading ORBIT BLR events…</span>
    </div>
  );
}
