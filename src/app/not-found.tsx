import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">404</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">This page is not here.</h1>
        <p className="mt-4 text-muted">It may have moved when the site became a single page.</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center bg-accent px-5 text-sm font-semibold text-accent-fg"
        >
          Back to Damien Yu
        </Link>
      </div>
    </main>
  );
}
