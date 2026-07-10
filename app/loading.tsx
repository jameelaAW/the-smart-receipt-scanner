export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="mb-8 flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 w-32 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
    </main>
  );
}
