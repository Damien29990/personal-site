import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-fg bg-[#c8c3b8] px-6 py-5 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-header md:flex-row md:items-center md:justify-between">
        <p>
          {site.name} · {site.location}
        </p>
        <p>English · 粵語 · 2026</p>
      </div>
    </footer>
  );
}
