# Examples

## Hero island (this site)

Server `Hero` imports the client wrapper. The wrapper — not `Hero` — owns `next/dynamic` + `ssr: false`.

```tsx
// src/components/Hero.tsx (Server Component)
import { SiteDiorama } from "@/components/SiteDiorama";

<section>
  <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
    <div className="md:col-span-8">{/* name, identity, CTA */}</div>
    <div className="md:col-span-4">
      <SiteDiorama />
      <p>{site.diorama.caption}</p>
    </div>
  </div>
</section>
```

```tsx
// src/components/SiteDiorama.tsx
"use client";

import dynamic from "next/dynamic";

const SiteDioramaCanvas = dynamic(() => import("./SiteDioramaCanvas"), {
  ssr: false,
  loading: () => <div className="h-full min-h-56 bg-surface" aria-hidden />,
});

export function SiteDiorama() {
  return (
    <div className="relative h-full min-h-56 overflow-hidden rounded-md border border-line bg-surface md:min-h-[28rem]">
      <SiteDioramaCanvas />
    </div>
  );
}
```

Canvas file default-exports a component that calls `createSiteScene(host)` in `useEffect` and returns `handle.dispose`.

## Do not

```tsx
// Server Component — this throws in Next.js 16
const Canvas = dynamic(() => import("./SiteDioramaCanvas"), { ssr: false });
```

```tsx
// Full-page fixed canvas behind <main> — forbidden (chrome, not artifact)
```
