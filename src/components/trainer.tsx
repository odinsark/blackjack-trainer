'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import {
  generateDrillHand,
  getPrimaryAction,
  actionLabel,
  type HandType,
  type DrillHand,
  type SimpleAction,
} from '@/data/strategy';

const FILTERS: { value: HandType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hard', label: 'Hard' },
  { value: 'soft', label: 'Soft' },
  { value: 'pair', label: 'Pairs' },
];

interface Stats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

export function Trainer() {
  const [hand, setHand] = useState<DrillHand | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [filter, setFilter] = useState<HandType>('all');
  const [surrenderAllowed, setSurrenderAllowed] = useState(true);

  const deal = useCallback(() => {
    setHand(generateDrillHand(filter));
    setResult(null);
    setCorrectAnswer('');
  }, [filter]);

  useEffect(() => { deal(); }, [deal]);

  const handleAction = (action: SimpleAction) => {
    if (!hand || result !== null) return;

    const correct = getPrimaryAction(hand.correctAction, surrenderAllowed);

    if (action === correct) {
      setResult('correct');
      setStats(s => ({
        total: s.total + 1,
        correct: s.correct + 1,
        streak: s.streak + 1,
        bestStreak: Math.max(s.bestStreak, s.streak + 1),
      }));
      setTimeout(deal, 700);
    } else {
      setResult('wrong');
      setCorrectAnswer(actionLabel(correct));
      setStats(s => ({ ...s, total: s.total + 1, streak: 0 }));
    }
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const isPair = hand?.handType === 'pair';
  const showSurrender = surrenderAllowed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Strategy Drill</h2>
        <p className="text-foreground-muted text-sm">
          Pick the correct play for each hand. Perfect basic strategy cuts the house edge below 0.5%.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Hands', value: stats.total },
          { label: 'Accuracy', value: stats.total > 0 ? `${accuracy}%` : '—' },
          { label: 'Streak', value: stats.streak },
          { label: 'Best', value: stats.bestStreak },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-lg p-3 text-center border border-rule">
            <div className="text-foreground-muted text-xs uppercase tracking-wider">{s.label}</div>
            <div className="text-foreground text-xl font-bold mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        {hand && (
          <motion.div
            key={hand.label + stats.total}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Result flash */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-lg p-3 text-center font-semibold text-sm ${
                    result === 'correct'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {result === 'correct' ? (
                    'Correct'
                  ) : (
                    <span>Wrong — correct play: <strong>{correctAnswer}</strong></span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hand label */}
            <div className="text-center text-foreground-muted text-sm font-medium tracking-wide">
              {hand.label}
            </div>

            {/* Dealer card */}
            <div className="text-center">
              <div className="text-foreground-dim text-xs uppercase tracking-widest mb-2">Dealer</div>
              <div className="flex justify-center">
                <PlayingCard rank={hand.dealerCard.rank} suit={hand.dealerCard.suit} size="lg" />
              </div>
            </div>

            {/* Player cards */}
            <div className="text-center">
              <div className="text-foreground-dim text-xs uppercase tracking-widest mb-2">Your Hand</div>
              <div className="flex justify-center gap-2">
                <PlayingCard rank={hand.playerCards[0].rank} suit={hand.playerCards[0].suit} size="lg" />
                <PlayingCard rank={hand.playerCards[1].rank} suit={hand.playerCards[1].suit} size="lg" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        {(['hit', 'stand', 'double'] as SimpleAction[]).map(a => (
          <button
            key={a}
            onClick={() => handleAction(a)}
            disabled={result !== null}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all
              ${result !== null ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
              ${a === 'hit' ? 'bg-rose-500/80 hover:bg-rose-500 text-white' : ''}
              ${a === 'stand' ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white' : ''}
              ${a === 'double' ? 'bg-amber-400/80 hover:bg-amber-400 text-gray-900' : ''}
            `}
          >
            {actionLabel(a)}
          </button>
        ))}
        {isPair && (
          <button
            onClick={() => handleAction('split')}
            disabled={result !== null}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-sky-500/80 hover:bg-sky-500 text-white
              ${result !== null ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
            `}
          >
            Split
          </button>
        )}
        {showSurrender && (
          <button
            onClick={() => handleAction('surrender')}
            disabled={result !== null}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-orange-400/80 hover:bg-orange-400 text-gray-900
              ${result !== null ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
            `}
          >
            Surrender
          </button>
        )}
      </div>

      {/* Next hand button when wrong */}
      {result === 'wrong' && (
        <button
          onClick={deal}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-foreground/10 hover:bg-foreground/15 text-foreground transition-colors"
        >
          Next Hand
        </button>
      )}

      {/* Filters and settings */}
      <div className="border-t border-rule pt-4 space-y-4">
        <div>
          <div className="text-foreground-dim text-xs uppercase tracking-widest mb-2">Hand Type</div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-accent text-background'
                    : 'bg-surface text-foreground-muted hover:text-foreground border border-rule'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={surrenderAllowed}
            onChange={e => setSurrenderAllowed(e.target.checked)}
            className="w-4 h-4 rounded border-rule accent-accent"
          />
          <span className="text-foreground-muted text-sm">Late surrender available</span>
        </label>
      </div>

      {/* Reset */}
      {stats.total > 0 && (
        <button
          onClick={() => {
            setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
            deal();
          }}
          className="text-foreground-dim text-xs hover:text-foreground-muted transition-colors"
        >
          Reset stats
        </button>
      )}
    </div>
  );
}
