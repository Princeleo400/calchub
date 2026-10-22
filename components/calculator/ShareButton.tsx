"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { track } from "@/lib/analytics";
import type { CalculatorSlug } from "@/lib/types";

/** Copies the current URL, which already carries the inputs (useShareableUrl). */
export function ShareButton({ calculator }: { calculator: CalculatorSlug }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(id);
  }, [state]);

  async function copy() {
    // Give a pending URL update (debounced 300ms) time to land first.
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      track("result_shared", { calculator });
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    >
      {state === "copied" ? (
        <Check
          className="size-3.5 text-green-600 dark:text-green-400"
          aria-hidden
        />
      ) : (
        <Link2 className="size-3.5" aria-hidden />
      )}
      <span aria-live="polite">
        {state === "copied"
          ? "Link copied"
          : state === "failed"
            ? "Copy failed"
            : "Share result"}
      </span>
    </button>
  );
}
