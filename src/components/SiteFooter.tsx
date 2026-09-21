import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="px-6 pb-12 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line pt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted md:flex-row md:items-center md:justify-between">
        <p>
          {site.drawingId} · {site.name} · {site.location}
        </p>
        <p>English · 粵語 · 2026</p>
      </div>
    </footer>
  );
}
