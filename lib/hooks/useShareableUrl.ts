"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculatorInputs, InputValue } from "@/lib/types";

/**
 * Keeps calculator inputs in sync with the URL query string, so any result
 * can be shared as a link (e.g. /mortgage-calculator?price=350000&rate=6.5).
 *
 * Why not useSearchParams: under prerendering it forces the calculator to
 * render client-side only, which would remove the default result and its
 * explanation from the static HTML Google reads. Instead the page prerenders
 * with defaults, URL values are applied after hydration, and updates use the
 * native History API (which Next.js keeps in sync with its router).
 *
 * Only values that differ from the defaults are written, keeping URLs short.
 */
export function useShareableUrl<T extends CalculatorInputs>(defaults: T) {
  const [values, setValues] = useState<T>(defaults);
  const [fromUrl, setFromUrl] = useState(false);
  const defaultsRef = useRef(defaults);
  const hydrated = useRef(false);

  // Read the URL once after mount.
  useEffect(() => {
    const parsed = parseParams(window.location.search, defaultsRef.current);
    if (parsed) {
      setValues(parsed);
      setFromUrl(true);
    }
    hydrated.current = true;
  }, []);

  // Write changes back to the URL (debounced so typing doesn't spam history).
  useEffect(() => {
    if (!hydrated.current) return;
    const id = window.setTimeout(() => {
      const query = toQuery(values, defaultsRef.current);
      const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      if (
        url !==
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      ) {
        window.history.replaceState(window.history.state, "", url);
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [values]);

  const update = useCallback((patch: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const replace = useCallback((next: Partial<T>) => {
    setValues({
      ...defaultsRef.current,
      ...pickKnown(next, defaultsRef.current),
    });
  }, []);

  const reset = useCallback(() => setValues(defaultsRef.current), []);

  return {
    values,
    /** Merge a change into the current inputs. */
    update,
    /** Replace all inputs, e.g. when restoring from history. Unknown keys are dropped. */
    replace,
    reset,
    /** True when the page was opened from a shared link with inputs in it. */
    fromUrl,
  };
}

function coerce(raw: string, fallback: InputValue): InputValue | undefined {
  if (typeof fallback === "number") {
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  if (typeof fallback === "boolean") {
    if (raw === "1" || raw === "true") return true;
    if (raw === "0" || raw === "false") return false;
    return undefined;
  }
  // Long enough for encoded lists (e.g. up to 10 debts), short enough to stay sane.
  return raw.slice(0, 2000);
}

function parseParams<T extends CalculatorInputs>(
  search: string,
  defaults: T,
): T | null {
  const params = new URLSearchParams(search);
  let changed = false;
  const result: CalculatorInputs = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const raw = params.get(key);
    if (raw === null) continue;
    const value = coerce(raw, defaults[key]);
    if (value !== undefined) {
      result[key] = value;
      changed = true;
    }
  }
  return changed ? (result as T) : null;
}

function toQuery(values: CalculatorInputs, defaults: CalculatorInputs): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === defaults[key]) continue;
    params.set(
      key,
      typeof value === "boolean" ? (value ? "1" : "0") : String(value),
    );
  }
  return params.toString();
}

function pickKnown<T extends CalculatorInputs>(
  input: Partial<T>,
  defaults: T,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = input[key];
    if (value !== undefined && typeof value === typeof defaults[key])
      out[key] = value;
  }
  return out;
}
