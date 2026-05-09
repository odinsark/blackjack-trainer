'use client';

import { useState } from 'react';
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

function ChartTable({
  title,
  rows,
  rowLabel,
  getAction,
}: {
  title: string;
  rows: number[];
  rowLabel: (v: number) => string;
  getAction: (row: number, dealer: number) => Action;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <table className="border-collapse text-sm min-w-[420px]">
          <thead>
            <tr>
              <th className="w-12 py-2 px-1 text-foreground-muted text-xs font-medium text-left" />
              {DEALER_COLS.map(d => (
                <th key={d} className="w-9 py-2 px-1 text-foreground-muted text-xs font-medium text-center">
                  {dealerCardLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td className="py-0.5 px-1 text-foreground font-medium text-xs text-left whitespace-nowrap">
                  {rowLabel(row)}
                </td>
                {DEALER_COLS.map(d => {
                  const action = getAction(row, d);
                  return (
                    <td key={d} className="p-0.5">
                      <div className={`${ACTION_COLORS[action]} rounded text-center text-xs font-bold py-1.5 px-1`}>
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
    </div>
  );
}

export function StrategyChart() {
  const [expanded, setExpanded] = useState<'hard' | 'soft' | 'pair' | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Basic Strategy Charts</h2>
        <p className="text-foreground-muted text-sm mb-4">
          Multi-deck, dealer stands on soft 17, double after split allowed, late surrender.
        </p>
        <div className="flex flex-wrap gap-3 text-xs mb-6">
          {Object.entries(ACTION_COLORS).map(([action, cls]) => (
            <div key={action} className="flex items-center gap-1.5">
              <div className={`${cls} w-6 h-5 rounded text-center font-bold leading-5`}>
                {ACTION_LABELS[action as Action]}
              </div>
              <span className="text-foreground-muted">
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

      <div className="space-y-8">
        <div>
          <button
            onClick={() => setExpanded(expanded === 'hard' ? null : 'hard')}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">Hard Totals</span>
            <span className="text-foreground-muted text-sm">{expanded === 'hard' ? 'collapse' : 'expand'}</span>
          </button>
          {expanded === 'hard' && (
            <div className="mt-3">
              <ChartTable
                title=""
                rows={HARD_ROWS}
                rowLabel={v => String(v) + (v === 17 ? '+' : '')}
                getAction={getHardAction}
              />
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setExpanded(expanded === 'soft' ? null : 'soft')}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">Soft Totals</span>
            <span className="text-foreground-muted text-sm">{expanded === 'soft' ? 'collapse' : 'expand'}</span>
          </button>
          {expanded === 'soft' && (
            <div className="mt-3">
              <ChartTable
                title=""
                rows={SOFT_ROWS}
                rowLabel={softRowLabel}
                getAction={getSoftAction}
              />
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setExpanded(expanded === 'pair' ? null : 'pair')}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">Pair Splitting</span>
            <span className="text-foreground-muted text-sm">{expanded === 'pair' ? 'collapse' : 'expand'}</span>
          </button>
          {expanded === 'pair' && (
            <div className="mt-3">
              <ChartTable
                title=""
                rows={PAIR_ROWS}
                rowLabel={pairRowLabel}
                getAction={getPairAction}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-rule pt-6">
        <h3 className="text-base font-semibold text-foreground mb-2">Why These Plays?</h3>
        <div className="text-foreground-muted text-sm space-y-2">
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
