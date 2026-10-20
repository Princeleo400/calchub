import { BMI_CATEGORIES, type BmiCategoryId } from "@/lib/calculators/bmi";
import { cn, formatNumber } from "@/lib/utils";

// The scale runs from 15 to 40. Values outside it pin to the ends.
const SCALE_MIN = 15;
const SCALE_MAX = 40;

const segments: Array<{
  id: BmiCategoryId | "obesity";
  label: string;
  from: number;
  to: number;
}> = [
  { id: "underweight", label: "Under", from: SCALE_MIN, to: 18.5 },
  { id: "healthy", label: "Healthy", from: 18.5, to: 25 },
  { id: "overweight", label: "Over", from: 25, to: 30 },
  { id: "obesity", label: "Obesity", from: 30, to: SCALE_MAX },
];

function position(value: number): number {
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

/**
 * Horizontal BMI scale with a marker. Category labels are always visible,
 * and the active segment is also named in text, so color is never the only cue.
 */
export function BmiScale({
  bmi,
  category,
}: {
  bmi: number;
  category: BmiCategoryId;
}) {
  const active = category.startsWith("obesity") ? "obesity" : category;
  const label = BMI_CATEGORIES.find((c) => c.id === category)?.label ?? "";

  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <figcaption className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Where you are on the scale
      </figcaption>
      <div className="relative mt-8" aria-hidden>
        {bmi > 0 && (
          <div
            className="absolute -top-6 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${position(bmi)}%` }}
          >
            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white dark:bg-slate-50 dark:text-slate-900">
              {formatNumber(bmi, 1)}
            </span>
            <span className="h-2 w-0.5 bg-slate-900 dark:bg-slate-50" />
          </div>
        )}
        <div className="flex h-3 gap-0.5 overflow-hidden rounded">
          {segments.map((s) => (
            <div
              key={s.id}
              style={{
                width: `${((s.to - s.from) / (SCALE_MAX - SCALE_MIN)) * 100}%`,
              }}
              className={cn(
                "h-full",
                s.id === active
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-slate-200 dark:bg-slate-700",
              )}
            />
          ))}
        </div>
        <div className="relative mt-1 h-4 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
          {[18.5, 25, 30].map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2"
              style={{ left: `${position(v)}%` }}
            >
              {v}
            </span>
          ))}
        </div>
        <div className="flex text-xs">
          {segments.map((s) => (
            <span
              key={s.id}
              style={{
                width: `${((s.to - s.from) / (SCALE_MAX - SCALE_MIN)) * 100}%`,
              }}
              className={cn(
                "truncate text-center",
                s.id === active
                  ? "font-semibold text-blue-700 dark:text-blue-300"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">
        Your BMI of {formatNumber(bmi, 1)} is in the {label} category.
      </p>
    </figure>
  );
}
