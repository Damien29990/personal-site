"use client";

import { useEffect } from "react";
import { homeUrl } from "@/lib/paths";

/** Client redirect — `redirect()` is not available with `output: "export"`. */
export function StaticHomeRedirect({ hash }: { hash?: string }) {
  const href = homeUrl(hash);

  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-muted">
        <a href={href} className="text-accent underline">
          Continue to Damien Yu
        </a>
      </p>
    </main>
  );
}
