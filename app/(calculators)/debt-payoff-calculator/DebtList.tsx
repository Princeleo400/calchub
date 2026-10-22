"use client";

import { useId } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { NumberField } from "@/components/calculator/NumberField";
import type { Debt } from "@/lib/calculators/debtPayoff";

export const MAX_DEBTS = 10;

interface DebtListProps {
  debts: Debt[];
  onChange: (debts: Debt[]) => void;
}

/** Editable list of debts: name, balance, APR and minimum payment for each. */
export function DebtList({ debts, onChange }: DebtListProps) {
  function patch(index: number, changes: Partial<Debt>) {
    onChange(
      debts.map((debt, position) =>
        position === index ? { ...debt, ...changes } : debt,
      ),
    );
  }

  function remove(index: number) {
    onChange(debts.filter((_debt, position) => position !== index));
  }

  function add() {
    if (debts.length >= MAX_DEBTS) return;
    onChange([
      ...debts,
      {
        name: `Debt ${debts.length + 1}`,
        balance: 1_000,
        rate: 15,
        minPayment: 30,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Your debts
      </p>
      <ul className="space-y-3">
        {debts.map((debt, index) => (
          <DebtRow
            key={index}
            index={index}
            debt={debt}
            canRemove={debts.length > 1}
            onPatch={(changes) => patch(index, changes)}
            onRemove={() => remove(index)}
          />
        ))}
      </ul>
      {debts.length < MAX_DEBTS ? (
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 text-sm font-medium text-slate-600 transition-colors duration-150 hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
        >
          <Plus className="size-4" aria-hidden />
          Add a debt
        </button>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You can add up to {MAX_DEBTS} debts.
        </p>
      )}
    </div>
  );
}

interface DebtRowProps {
  index: number;
  debt: Debt;
  canRemove: boolean;
  onPatch: (changes: Partial<Debt>) => void;
  onRemove: () => void;
}

function DebtRow({ index, debt, canRemove, onPatch, onRemove }: DebtRowProps) {
  const nameId = useId();
  const label = debt.name || `Debt ${index + 1}`;
  const interest = (debt.balance * debt.rate) / 100 / 12;
  const tooLow = debt.balance > 0 && debt.minPayment <= interest;

  return (
    <li className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <label htmlFor={nameId} className="sr-only">
          Name of debt {index + 1}
        </label>
        <input
          id={nameId}
          type="text"
          value={debt.name}
          maxLength={40}
          placeholder={`Debt ${index + 1}`}
          onChange={(event) => onPatch({ name: event.target.value })}
          className="h-9 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-slate-900 transition-colors duration-150 outline-none placeholder:text-slate-400 hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:text-slate-50 dark:hover:border-slate-700"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <NumberField
          label="Balance"
          prefix="$"
          grouped
          decimals={0}
          min={0}
          max={10_000_000}
          value={debt.balance}
          onChange={(balance) => onPatch({ balance })}
        />
        <NumberField
          label="APR"
          suffix="%"
          decimals={2}
          min={0}
          max={100}
          value={debt.rate}
          onChange={(rate) => onPatch({ rate })}
        />
        <NumberField
          label="Minimum"
          prefix="$"
          grouped
          decimals={0}
          min={0}
          max={1_000_000}
          value={debt.minPayment}
          onChange={(minPayment) => onPatch({ minPayment })}
        />
      </div>
      {tooLow && (
        <p className="mt-2 flex gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Warning:</strong> this minimum
            doesn&apos;t cover the monthly interest (about $
            {Math.ceil(interest)}), so on its own this balance would never
            shrink.
          </span>
        </p>
      )}
    </li>
  );
}
