import type { ReactNode } from "react";

interface CalculatorPanelProps {
  /** The input fields. */
  inputs: ReactNode;
  /** ResultCard, InsightCard, chart: everything that reacts to the inputs. */
  results: ReactNode;
  /** Below both columns: formula reveal, history panel. */
  footer?: ReactNode;
}

/** Two-column calculator: inputs on the left, results on the right. Stacks on mobile. */
export function CalculatorPanel({ inputs, results, footer }: CalculatorPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <section
          aria-label="Inputs"
          className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50"
        >
          {inputs}
        </section>
        <div className="space-y-4">{results}</div>
      </div>
      {footer && <div className="space-y-4">{footer}</div>}
    </div>
  );
}
