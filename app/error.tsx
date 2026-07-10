"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-medium text-red-800">Couldn&apos;t load your receipts</p>
        <p className="mt-1 text-sm text-red-600">{error.message || "Something went wrong."}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
