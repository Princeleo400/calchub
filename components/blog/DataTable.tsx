import type { ReactNode } from "react";

interface DataTableProps {
  caption?: string;
  headers: string[];
  rows: ReactNode[][];
  /** Column indexes to right-align (numbers). */
  numeric?: number[];
}

/** Simple, accessible table for article data. The first column is the row header. */
export function DataTable({ caption, headers, rows, numeric = [] }: DataTableProps) {
  const align = (i: number) => (numeric.includes(i) ? "text-right" : "text-left");
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm tabular-nums">
        {caption && <caption className="mb-2 text-left text-xs text-slate-500 dark:text-slate-400">{caption}</caption>}
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <tr>
            {headers.map((h, i) => (
              <th key={h} scope="col" className={`py-2 pr-4 font-medium last:pr-0 ${align(i)}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className={`py-2 pr-4 font-normal ${align(i)}`}>
                    {cell}
                  </th>
                ) : (
                  <td key={i} className={`py-2 pr-4 last:pr-0 ${align(i)}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
