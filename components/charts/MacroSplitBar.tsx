import type { Macro, MacroAmount } from "@/lib/calculators/macro";
import { formatNumber } from "@/lib/utils";

// Validated categorical slots 1 to 3 (blue, orange, aqua), stepped per theme.
// Aqua is below 3:1 contrast on white, so every segment is also labelled
// in the legend below the bar.
const barVars =
  "[--series-1:#2a78d6] [--series-2:#eb6834] [--series-3:#1baf7a] " +
  "dark:[--series-1:#3987e5] dark:[--series-2:#d95926] dark:[--series-3:#199e70]";

export const MACRO_LABELS: Record<Macro, string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const MACRO_COLORS: Record<Macro, string> = {
  protein: "bg-[var(--series-1)]",
  carbs: "bg-[var(--series-2)]",
  fat: "bg-[var(--series-3)]",
};

const ORDER: Macro[] = ["protein", "carbs", "fat"];

/** One horizontal bar showing each macro's share of daily calories. */
export function MacroSplitBar({
  amounts,
}: {
  amounts: Record<Macro, MacroAmount>;
}) {
  const total = ORDER.reduce((sum, macro) => sum + amounts[macro].percent, 0);
  if (total <= 0) return null;

  return (
    <div className={barVars}>
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-sm"
        role="img"
        aria-label={ORDER.map(
          (macro) =>
            `${MACRO_LABELS[macro]} ${formatNumber(amounts[macro].percent)}%`,
        ).join(", ")}
      >
        {ORDER.map((macro) =>
          amounts[macro].percent > 0 ? (
            <div
              key={macro}
              className={MACRO_COLORS[macro]}
              style={{ width: `${(amounts[macro].percent / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        {ORDER.map((macro) => (
          <li key={macro} className="flex items-center gap-1.5">
            <span
              className={`size-2.5 rounded-sm ${MACRO_COLORS[macro]}`}
              aria-hidden
            />
            {MACRO_LABELS[macro]} {formatNumber(amounts[macro].percent)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
