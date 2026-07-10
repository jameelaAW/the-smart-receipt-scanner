import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-4xl">👋</p>
      <h1 className="mt-3 text-xl font-bold text-neutral-900">Checkout canceled</h1>
      <p className="mt-1 text-sm text-neutral-500">No charge was made. You can upgrade any time.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to receipts
      </Link>
    </main>
  );
}
