'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import {
  generateDrillHand,
  getPrimaryAction,
  getExplanation,
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

const ease = [0.16, 1, 0.3, 1] as const;

export function Trainer() {
  const [hand, setHand] = useState<DrillHand | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [filter, setFilter] = useState<HandType>('all');
  const [surrenderAllowed, setSurrenderAllowed] = useState(true);

  const deal = useCallback(() => {
    setHand(generateDrillHand(filter));
    setResult(null);
    setCorrectAnswer('');
    setExplanation('');
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
      setExplanation(getExplanation(hand, correct));
      setStats(s => ({ ...s, total: s.total + 1, streak: 0 }));
    }
  };

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const isPair = hand?.handType === 'pair';

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim mb-3">Strategy Drill</p>
        <p className="text-foreground-muted text-base sm:text-lg leading-relaxed max-w-[48ch]">
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
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease }}
            className="bg-surface border border-rule rounded-2xl p-4 text-center"
          >
            <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em]">{s.label}</div>
            <div className="text-foreground text-xl font-semibold mt-1 tabular-nums">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        {hand && (
          <motion.div
            key={hand.label + stats.total}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-6"
          >
            {/* Result flash */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className={`rounded-2xl p-5 text-center border ${
                    result === 'correct'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {result === 'correct' ? (
                    <span className="font-semibold text-base">Correct</span>
                  ) : (
                    <>
                      <span className="font-semibold text-base">Wrong &mdash; correct play: {correctAnswer}</span>
                      {explanation && (
                        <p className="mt-2 text-sm font-normal text-rose-300/70 leading-relaxed">{explanation}</p>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hand label */}
            <div className="text-center text-foreground-muted text-xs font-medium uppercase tracking-[0.2em]">
              {hand.label}
            </div>

            {/* Dealer card */}
            <div className="text-center">
              <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em] mb-3">Dealer</div>
              <div className="flex justify-center">
                <PlayingCard rank={hand.dealerCard.rank} suit={hand.dealerCard.suit} size="lg" />
              </div>
            </div>

            {/* Player cards */}
            <div className="text-center">
              <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em] mb-3">Your Hand</div>
              <div className="flex justify-center gap-3">
                <PlayingCard rank={hand.playerCards[0].rank} suit={hand.playerCards[0].suit} size="lg" />
                <PlayingCard rank={hand.playerCards[1].rank} suit={hand.playerCards[1].suit} size="lg" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {(['hit', 'stand', 'double'] as SimpleAction[]).map(a => (
          <button
            key={a}
            onClick={() => handleAction(a)}
            disabled={result !== null}
            className={`h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] transition-all duration-200
              ${result !== null ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
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
            className={`h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] transition-all duration-200 bg-sky-500/80 hover:bg-sky-500 text-white
              ${result !== null ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
            `}
          >
            Split
          </button>
        )}
        {surrenderAllowed && (
          <button
            onClick={() => handleAction('surrender')}
            disabled={result !== null}
            className={`h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] transition-all duration-200 bg-orange-400/80 hover:bg-orange-400 text-gray-900
              ${result !== null ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.97]'}
            `}
          >
            Surrender
          </button>
        )}
      </div>

      {/* Next hand button when wrong */}
      {result === 'wrong' && (
        <div className="flex justify-center">
          <button
            onClick={deal}
            className="h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] border border-rule text-foreground hover:bg-foreground hover:text-background transition-colors duration-200"
          >
            Next Hand
          </button>
        </div>
      )}

      {/* Filters and settings */}
      <div className="border-t border-rule pt-8 space-y-5">
        <div>
          <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em] mb-3">Hand Type</div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`h-8 px-4 rounded-full text-xs font-medium transition-colors duration-200 ${
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

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={surrenderAllowed}
            onChange={e => setSurrenderAllowed(e.target.checked)}
            className="w-4 h-4 rounded border-rule accent-accent"
          />
          <span className="text-foreground-muted text-sm">Late surrender available</span>
        </label>
      </div>

      {stats.total > 0 && (
        <button
          onClick={() => {
            setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
            deal();
          }}
          className="text-foreground-dim text-xs font-medium uppercase tracking-[0.1em] hover:text-foreground-muted transition-colors"
        >
          Reset stats
        </button>
      )}
    </div>
  );
}
