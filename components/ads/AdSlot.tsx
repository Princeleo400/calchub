"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AdPosition = "header" | "sidebar" | "in-content" | "footer" | "mobile-banner";

// Reserved heights stop the page jumping when an ad loads (layout shift).
const positions: Record<AdPosition, { size: string; className: string }> = {
  header: { size: "728 x 90", className: "hidden md:flex min-h-[90px] max-w-[728px]" },
  sidebar: { size: "300 x 250", className: "hidden lg:flex min-h-[250px] w-[300px]" },
  "in-content": { size: "336 x 280", className: "flex min-h-[280px] max-w-[336px]" },
  footer: { size: "728 x 90", className: "hidden md:flex min-h-[90px] max-w-[728px]" },
  "mobile-banner": { size: "320 x 50", className: "flex md:hidden min-h-[50px] max-w-[320px]" },
};

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  position: AdPosition;
  /** AdSense ad unit id for this position (data-ad-slot). */
  slot?: string;
  className?: string;
}

/**
 * Shows a labelled placeholder until AdSense is approved and
 * NEXT_PUBLIC_ADSENSE_CLIENT plus a slot id are set; then the real unit.
 * The AdSense loader script itself is added in the root layout at approval.
 */
export function AdSlot({ position, slot, className }: AdSlotProps) {
  const config = positions[position];
  const live = Boolean(client && slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Ad blockers throw here; the reserved space simply stays empty.
    }
  }, [live]);

  return (
    <div
      className={cn(
        "mx-auto w-full flex-col items-center justify-center",
        config.className,
        !live && "rounded-md border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      {live ? (
        <ins
          className="adsbygoogle block w-full"
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Advertisement &middot; {config.size}
        </span>
      )}
    </div>
  );
}
