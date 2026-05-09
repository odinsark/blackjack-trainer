'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HARD_ROWS, SOFT_ROWS, PAIR_ROWS, DEALER_COLS,
  getHardAction, getSoftAction, getPairAction,
  softRowLabel, pairRowLabel, dealerCardLabel,
  type Action,
} from '@/data/strategy';

const ACTION_COLORS: Record<Action, string> = {
  H: 'bg-rose-500/80 text-white',
  S: 'bg-emerald-500/80 text-white',
  D: 'bg-amber-400/90 text-gray-900',
  Ds: 'bg-amber-400/60 text-gray-900',
  P: 'bg-sky-500/80 text-white',
  Rh: 'bg-orange-400/80 text-gray-900',
};

const ACTION_LABELS: Record<Action, string> = {
  H: 'H',
  S: 'S',
  D: 'D',
  Ds: 'Ds',
  P: 'P',
  Rh: 'Rh',
};

const ease = [0.16, 1, 0.3, 1] as const;

function ChartTable({
  rows,
  rowLabel,
  getAction,
}: {
  rows: number[];
  rowLabel: (v: number) => string;
  getAction: (row: number, dealer: number) => Action;
}) {
  return (
    <div className="overflow-x-auto -mx-7 px-7 sm:-mx-9 sm:px-9 pb-2">
      <table className="border-collapse text-sm min-w-[420px]">
        <thead>
          <tr>
            <th className="w-12 py-2 px-1 text-foreground-dim text-[10px] uppercase tracking-[0.15em] font-medium text-left" />
            {DEALER_COLS.map(d => (
              <th key={d} className="w-9 py-2 px-1 text-foreground-dim text-[10px] uppercase tracking-wider font-medium text-center">
                {dealerCardLabel(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row}>
              <td className="py-0.5 px-1 text-foreground font-medium text-xs text-left whitespace-nowrap tabular-nums">
                {rowLabel(row)}
              </td>
              {DEALER_COLS.map(d => {
                const action = getAction(row, d);
                return (
                  <td key={d} className="p-0.5">
                    <div className={`${ACTION_COLORS[action]} rounded-lg text-center text-xs font-bold py-1.5 px-1`}>
                      {ACTION_LABELS[action]}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: Array<{
  key: 'hard' | 'soft' | 'pair';
  label: string;
  rows: number[];
  rowLabel: (v: number) => string;
  getAction: (row: number, dealer: number) => Action;
}> = [
  { key: 'hard', label: 'Hard Totals', rows: HARD_ROWS, rowLabel: (v) => String(v) + (v === 17 ? '+' : ''), getAction: getHardAction },
  { key: 'soft', label: 'Soft Totals', rows: SOFT_ROWS, rowLabel: softRowLabel, getAction: getSoftAction },
  { key: 'pair', label: 'Pair Splitting', rows: PAIR_ROWS, rowLabel: pairRowLabel, getAction: getPairAction },
];

export function StrategyChart() {
  const [expanded, setExpanded] = useState<'hard' | 'soft' | 'pair' | null>(null);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-foreground-dim mb-3">Basic Strategy Charts</p>
        <p className="text-foreground-muted text-sm leading-relaxed mb-6 max-w-[48ch]">
          Multi-deck, dealer stands on soft 17, double after split allowed, late surrender.
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(ACTION_COLORS).map(([action, cls]) => (
            <div key={action} className="flex items-center gap-1.5">
              <div className={`${cls} w-6 h-5 rounded-md text-center font-bold leading-5`}>
                {ACTION_LABELS[action as Action]}
              </div>
              <span className="text-foreground-dim">
                {{
                  H: 'Hit',
                  S: 'Stand',
                  D: 'Double (or hit)',
                  Ds: 'Double (or stand)',
                  P: 'Split',
                  Rh: 'Surrender (or hit)',
                }[action]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map(chart => (
          <div key={chart.key} className="bg-surface border border-rule rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === chart.key ? null : chart.key)}
              className="w-full flex items-center justify-between px-7 py-5 sm:px-9 text-left group"
            >
              <span className="text-base font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                {chart.label}
              </span>
              <span className="text-foreground-dim text-xs uppercase tracking-[0.1em]">
                {expanded === chart.key ? 'collapse' : 'expand'}
              </span>
            </button>
            <AnimatePresence>
              {expanded === chart.key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="overflow-hidden"
                >
                  <div className="px-7 pb-7 sm:px-9 sm:pb-9">
                    <ChartTable
                      rows={chart.rows}
                      rowLabel={chart.rowLabel}
                      getAction={chart.getAction}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground-dim mb-3">Why These Plays?</p>
        <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
          <p>
            Basic strategy is derived from computer simulations of millions of hands. Every cell
            represents the play that loses the least (or wins the most) money over time.
          </p>
          <p>
            Perfect basic strategy reduces the house edge to roughly 0.5%, making blackjack
            the most beatable table game in the casino before counting enters the picture.
          </p>
        </div>
      </div>
    </div>
  );
}
