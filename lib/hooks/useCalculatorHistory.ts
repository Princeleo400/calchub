"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useSyncExternalStore,
} from "react";
import type {
  CalculationRecord,
  CalculatorInputs,
  CalculatorSlug,
} from "@/lib/types";

const STORAGE_KEY = "calchub_history";
const CHANGE_EVENT = "calchub-history-change";
const MAX_TOTAL = 50;
const MAX_PER_CALCULATOR = 20;
const EMPTY: CalculationRecord[] = [];

// --- external store over localStorage -------------------------------------

let cachedRaw: string | null = null;
let cachedRecords: CalculationRecord[] = EMPTY;

function readAll(): CalculationRecord[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedRecords;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedRecords = Array.isArray(parsed) ? parsed.filter(isRecord) : EMPTY;
  } catch {
    cachedRecords = EMPTY;
  }
  return cachedRecords;
}

function writeAll(records: CalculationRecord[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.slice(0, MAX_TOTAL)),
    );
  } catch {
    // Storage full or blocked: history is a convenience, so fail quietly.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) =>
    event.key === STORAGE_KEY && onChange();
  window.addEventListener("storage", onStorage); // other tabs
  window.addEventListener(CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function isRecord(value: unknown): value is CalculationRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.calculator === "string" &&
    typeof record.result === "string" &&
    typeof record.summary === "string" &&
    typeof record.timestamp === "number" &&
    typeof record.inputs === "object" &&
    record.inputs !== null
  );
}

function sameInputs(
  first: CalculatorInputs,
  second: CalculatorInputs,
): boolean {
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  for (const key of keys) if (first[key] !== second[key]) return false;
  return true;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- hooks -----------------------------------------------------------------

/** Saved calculations for one calculator, newest first. Empty during prerender. */
export function useCalculatorHistory(calculator: CalculatorSlug) {
  const all = useSyncExternalStore(subscribe, readAll, () => EMPTY);

  const records = useMemo(
    () =>
      all
        .filter((record) => record.calculator === calculator)
        .slice(0, MAX_PER_CALCULATOR),
    [all, calculator],
  );

  const add = useCallback(
    (entry: Omit<CalculationRecord, "id" | "timestamp" | "calculator">) => {
      const current = readAll();
      const latest = current.find((record) => record.calculator === calculator);
      // Skip exact repeats of the most recent calculation.
      if (latest && sameInputs(latest.inputs, entry.inputs)) return;
      writeAll([
        { ...entry, calculator, id: newId(), timestamp: Date.now() },
        ...current,
      ]);
    },
    [calculator],
  );

  const remove = useCallback((id: string) => {
    writeAll(readAll().filter((record) => record.id !== id));
  }, []);

  const clear = useCallback(() => {
    writeAll(readAll().filter((record) => record.calculator !== calculator));
  }, [calculator]);

  return { records, add, remove, clear };
}

/**
 * Saves a calculation once the inputs have stayed unchanged for `delay` ms.
 * Default inputs are never saved, so simply opening a page adds nothing.
 */
export function useRecordCalculation(opts: {
  calculator: CalculatorSlug;
  inputs: CalculatorInputs;
  defaults: CalculatorInputs;
  result: string;
  summary: string;
  /** Set false while inputs are invalid. */
  enabled?: boolean;
  delay?: number;
}) {
  const {
    calculator,
    inputs,
    defaults,
    result,
    summary,
    enabled = true,
    delay = 1500,
  } = opts;
  const { add } = useCalculatorHistory(calculator);
  // Reads the latest result and summary when it fires, without re-arming the timer.
  const save = useEffectEvent(() => add({ result, summary, inputs }));

  const key = JSON.stringify(inputs);
  const isDefault = sameInputs(inputs, defaults);

  useEffect(() => {
    if (!enabled || isDefault) return;
    const id = window.setTimeout(save, delay);
    return () => window.clearTimeout(id);
  }, [key, enabled, isDefault, delay]);
}
