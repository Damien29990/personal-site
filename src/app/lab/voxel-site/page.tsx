import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { VoxelSiteStage } from "@/components/voxel-site/VoxelSiteStage";

export const metadata: Metadata = {
  title: "40F Smart Site Assembly — Damien Yu",
  description:
    "A procedural, step-by-step assembly animation of a 40-storey Hong Kong smart construction site — glazed podium, exposed steel frame, tower crane deployment, and IoT sensor activation — built with React Three Fiber, drei, and react-spring.",
};

export default function VoxelSiteLabPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <section className="border-b border-line px-6 pt-10 pb-14 md:px-8 md:pt-14 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between border-b border-line pb-3 font-display text-[10px] uppercase tracking-[0.18em] text-muted">
              <p>
                <Link href="/" className="link-line text-fg">
                  Damien Yu
                </Link>
                {" · Lab"}
              </p>
              <p>DY-LAB-002</p>
            </div>

            <div className="mt-8 md:mt-10">
              <p className="font-display text-[11px] uppercase tracking-[0.2em] text-accent">
                Procedural assembly study
              </p>
              <h1 className="mt-3 font-display text-[clamp(2rem,6vw,4rem)] uppercase leading-[0.92] tracking-tight">
                40F smart site, one block at a time
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                A toy-diorama build sequence for a Hong Kong high-rise: ground works, a glazed podium, an exposed
                steel top, a tower crane deployment, then the site&rsquo;s IoT sensors switching on — five phases,
                replayed on a loop.
              </p>
            </div>

            <figure className="mt-8 md:mt-10">
              <VoxelSiteStage />
              <figcaption className="mt-3 font-display text-[10px] uppercase tracking-[0.16em] text-muted">
                Procedural Three.js — React Three Fiber, drei, and react-spring. No pre-baked models.
              </figcaption>
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
