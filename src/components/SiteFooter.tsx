import { TechStack } from "@/components/TechStack";
import { site } from "@/content/site";

const builtWith = ["Next.js", "React.js", "Three.js", "TypeScript", "Tailwind CSS"] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-fg bg-[#c8c3b8] px-6 py-5 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-header sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name} · {site.location}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p>Built with</p>
          <TechStack items={builtWith} plain />
        </div>
      </div>
    </footer>
  );
}
