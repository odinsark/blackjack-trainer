'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import { createShoe, hiLoValue, type Card } from '@/data/strategy';

const SPEEDS = [
  { label: 'Slow', ms: 3000 },
  { label: 'Medium', ms: 1500 },
  { label: 'Fast', ms: 800 },
  { label: 'Casino', ms: 450 },
];

const ILLUSTRIOUS_18 = [
  { index: 'Insurance', tc: 3, play: 'Take insurance / even money', normal: 'Never insure' },
  { index: '16 vs 10', tc: 0, play: 'Stand', normal: 'Hit' },
  { index: '15 vs 10', tc: 4, play: 'Stand', normal: 'Hit' },
  { index: '10,10 vs 5', tc: 5, play: 'Split', normal: 'Stand' },
  { index: '10,10 vs 6', tc: 4, play: 'Split', normal: 'Stand' },
  { index: '10 vs 10', tc: 4, play: 'Double', normal: 'Hit' },
  { index: '12 vs 3', tc: 2, play: 'Stand', normal: 'Hit' },
  { index: '12 vs 2', tc: 3, play: 'Stand', normal: 'Hit' },
  { index: '11 vs A', tc: 1, play: 'Double', normal: 'Double' },
  { index: '9 vs 2', tc: 1, play: 'Double', normal: 'Hit' },
  { index: '10 vs A', tc: 4, play: 'Double', normal: 'Hit' },
  { index: '9 vs 7', tc: 3, play: 'Double', normal: 'Hit' },
  { index: '16 vs 9', tc: 5, play: 'Stand', normal: 'Hit' },
  { index: '13 vs 2', tc: -1, play: 'Hit', normal: 'Stand' },
  { index: '12 vs 4', tc: 0, play: 'Stand (TC ≥ 0)', normal: 'Stand' },
  { index: '12 vs 5', tc: -2, play: 'Stand', normal: 'Stand' },
  { index: '12 vs 6', tc: -1, play: 'Stand', normal: 'Stand' },
  { index: '13 vs 3', tc: -2, play: 'Hit', normal: 'Stand' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Counting() {
  const [shoe, setShoe] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const [deckCount, setDeckCount] = useState(6);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [showCount, setShowCount] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [guessInput, setGuessInput] = useState('');
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null);
  const [activeSection, setActiveSection] = useState<'practice' | 'learn' | 'deviations'>('learn');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newShoe = useCallback(() => {
    setShoe(createShoe(deckCount));
    setCurrentIndex(0);
    setRunningCount(0);
    setShowCount(false);
    setGuessInput('');
    setGuessResult(null);
    setAutoPlay(false);
  }, [deckCount]);

  useEffect(() => { newShoe(); }, [newShoe]);

  const nextCard = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= shoe.length) return prev;
      const card = shoe[prev];
      setRunningCount(c => c + hiLoValue(card.rank));
      return prev + 1;
    });
  }, [shoe]);

  useEffect(() => {
    if (autoPlay && currentIndex < shoe.length) {
      intervalRef.current = setInterval(nextCard, speed);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (currentIndex >= shoe.length) setAutoPlay(false);
  }, [autoPlay, nextCard, speed, currentIndex, shoe.length]);

  const checkGuess = () => {
    const guess = parseInt(guessInput);
    if (isNaN(guess)) return;
    setGuessResult(guess === runningCount ? 'correct' : 'wrong');
    setShowCount(true);
  };

  const currentCard = currentIndex > 0 ? shoe[currentIndex - 1] : null;
  const decksRemaining = Math.max(1, (shoe.length - currentIndex) / 52);
  const trueCount = runningCount / decksRemaining;
  const progress = shoe.length > 0 ? (currentIndex / shoe.length) * 100 : 0;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim mb-3">Card Counting</p>
        <p className="text-foreground-muted text-base sm:text-lg leading-relaxed max-w-[48ch]">
          Master the Hi-Lo system to gain a mathematical edge over the house.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {[
          { value: 'learn' as const, label: 'How It Works' },
          { value: 'practice' as const, label: 'Practice' },
          { value: 'deviations' as const, label: 'Deviations' },
        ].map(s => (
          <button
            key={s.value}
            onClick={() => setActiveSection(s.value)}
            className={`h-8 px-4 rounded-full text-xs font-medium transition-colors duration-200 ${
              activeSection === s.value
                ? 'bg-accent text-background'
                : 'bg-surface text-foreground-muted hover:text-foreground border border-rule'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Learn section */}
      {activeSection === 'learn' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="space-y-4"
        >
          <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9 space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim">The Hi-Lo System</p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              Card counting tracks the ratio of high cards to low cards remaining in the shoe.
              When the deck is rich in 10s and Aces, the player has an advantage &mdash; more blackjacks,
              better doubles, and the dealer busts more often.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-emerald-400 text-2xl font-semibold">+1</div>
                <div className="text-foreground-muted text-xs mt-1.5">2, 3, 4, 5, 6</div>
                <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em] mt-0.5">Low cards</div>
              </div>
              <div className="bg-foreground/5 border border-rule rounded-xl p-4">
                <div className="text-foreground-muted text-2xl font-semibold">0</div>
                <div className="text-foreground-muted text-xs mt-1.5">7, 8, 9</div>
                <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em] mt-0.5">Neutral</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <div className="text-rose-400 text-2xl font-semibold">&minus;1</div>
                <div className="text-foreground-muted text-xs mt-1.5">10, J, Q, K, A</div>
                <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em] mt-0.5">High cards</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9 space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim">Running Count &rarr; True Count</p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              The running count alone doesn&apos;t account for how many cards remain. Divide the running count
              by the number of decks remaining to get the <strong className="text-foreground">true count</strong>.
              The true count drives your betting and playing decisions.
            </p>
            <div className="bg-background rounded-xl p-4 text-center border border-rule">
              <span className="text-foreground font-mono text-sm tracking-wide">
                True Count = Running Count / Decks Remaining
              </span>
            </div>
          </div>

          <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9 space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim">Betting Spread</p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              Increase your bet when the true count is positive (advantage shifts to you).
              The bigger the true count, the larger the edge.
            </p>
            <div className="space-y-0">
              {[
                { tc: 'TC ≤ 0', bet: '1 unit (minimum)', edge: 'House has edge' },
                { tc: 'TC +1', bet: '1–2 units', edge: 'Near break-even' },
                { tc: 'TC +2', bet: '2–4 units', edge: 'Player edge ~0.5%' },
                { tc: 'TC +3', bet: '4–8 units', edge: 'Player edge ~1%' },
                { tc: 'TC +4', bet: '8–12 units', edge: 'Player edge ~1.5%' },
                { tc: 'TC +5+', bet: 'Max bet', edge: 'Strong player edge' },
              ].map(row => (
                <div key={row.tc} className="flex items-center gap-3 py-2.5 border-b border-rule last:border-0">
                  <span className="text-foreground font-mono text-xs w-16 shrink-0 tabular-nums">{row.tc}</span>
                  <span className="text-foreground-muted text-sm flex-1">{row.bet}</span>
                  <span className="text-foreground-dim text-xs">{row.edge}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-foreground-dim text-xs leading-relaxed">
            Card counting is legal. Casinos may ask you to leave but it is not a crime.
            This trainer is for educational and mathematical purposes.
          </p>
        </motion.div>
      )}

      {/* Practice section */}
      {activeSection === 'practice' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="space-y-8"
        >
          {/* Settings */}
          <div className="flex flex-wrap gap-6 items-start">
            <div>
              <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em] mb-2">Decks</div>
              <div className="flex gap-1.5">
                {[1, 2, 6, 8].map(d => (
                  <button
                    key={d}
                    onClick={() => setDeckCount(d)}
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors duration-200 ${
                      deckCount === d
                        ? 'bg-accent text-background'
                        : 'bg-surface text-foreground-muted border border-rule hover:text-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.2em] mb-2">Speed</div>
              <div className="flex gap-1.5">
                {SPEEDS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSpeed(s.ms)}
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors duration-200 ${
                      speed === s.ms
                        ? 'bg-accent text-background'
                        : 'bg-surface text-foreground-muted border border-rule hover:text-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer pt-5">
              <input
                type="checkbox"
                checked={showValues}
                onChange={e => setShowValues(e.target.checked)}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-foreground-muted text-sm">Show Hi-Lo values</span>
            </label>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-foreground-dim tabular-nums tracking-wider">
              <span>{currentIndex} / {shoe.length} cards</span>
              <span>{Math.round(decksRemaining * 10) / 10} decks left</span>
            </div>
            <div className="h-1 bg-surface rounded-full overflow-hidden border border-rule">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current card */}
          <div className="flex flex-col items-center gap-3 py-6">
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div
                  key={`${currentIndex}-${currentCard.rank}-${currentCard.suit}`}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <PlayingCard rank={currentCard.rank} suit={currentCard.suit} size="lg" />
                  {showValues && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-lg font-semibold ${
                        hiLoValue(currentCard.rank) > 0
                          ? 'text-emerald-400'
                          : hiLoValue(currentCard.rank) < 0
                          ? 'text-rose-400'
                          : 'text-foreground-muted'
                      }`}
                    >
                      {hiLoValue(currentCard.rank) > 0 ? '+1' : hiLoValue(currentCard.rank) < 0 ? '−1' : '0'}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <PlayingCard rank="A" suit="spades" size="lg" faceDown />
                  <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em]">Ready</div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={nextCard}
              disabled={currentIndex >= shoe.length || autoPlay}
              className="h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] bg-accent/80 hover:bg-accent text-background transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Card
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              disabled={currentIndex >= shoe.length}
              className={`h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                autoPlay
                  ? 'bg-rose-500/80 hover:bg-rose-500 text-white'
                  : 'border border-rule text-foreground hover:bg-foreground/10'
              }`}
            >
              {autoPlay ? 'Pause' : 'Auto'}
            </button>
            <button
              onClick={newShoe}
              className="h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] border border-rule text-foreground-muted hover:text-foreground transition-colors duration-200"
            >
              New Shoe
            </button>
          </div>

          {/* Count check */}
          <div className="bg-surface border border-rule rounded-2xl px-7 py-6 sm:px-9 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-base font-medium">What is the running count?</span>
              <button
                onClick={() => setShowCount(!showCount)}
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium uppercase tracking-[0.1em]"
              >
                {showCount ? 'Hide' : 'Reveal'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={guessInput}
                onChange={e => { setGuessInput(e.target.value); setGuessResult(null); }}
                onKeyDown={e => e.key === 'Enter' && checkGuess()}
                placeholder="±"
                className="flex-1 bg-background border border-rule rounded-xl px-4 py-2.5 text-foreground text-sm font-mono focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={checkGuess}
                className="h-12 px-8 rounded-full text-sm font-medium uppercase tracking-[0.12em] bg-accent/80 hover:bg-accent text-background transition-colors duration-200"
              >
                Check
              </button>
            </div>

            <AnimatePresence>
              {guessResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-base font-medium ${
                    guessResult === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {guessResult === 'correct'
                    ? 'Correct!'
                    : `Wrong — the running count is ${runningCount >= 0 ? '+' : ''}${runningCount}`}
                </motion.div>
              )}
            </AnimatePresence>

            {showCount && (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-rule">
                <div>
                  <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em]">Running Count</div>
                  <div className="text-foreground text-xl font-semibold font-mono mt-1 tabular-nums">
                    {runningCount >= 0 ? '+' : ''}{runningCount}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-dim text-xs font-medium uppercase tracking-[0.15em]">True Count</div>
                  <div className="text-foreground text-xl font-semibold font-mono mt-1 tabular-nums">
                    {trueCount >= 0 ? '+' : ''}{Math.round(trueCount * 10) / 10}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Deviations section */}
      {activeSection === 'deviations' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="space-y-4"
        >
          <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9 space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim">The Illustrious 18</p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              Once you can count, you deviate from basic strategy based on the true count.
              These 18 plays capture most of the value from index plays. The first few
              (insurance, 16v10, 15v10) account for the majority of the gain.
            </p>
          </div>

          <div className="bg-surface border border-rule rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="text-left py-3 px-7 sm:px-9 text-foreground-dim font-medium text-xs uppercase tracking-[0.15em]">Hand</th>
                    <th className="text-center py-3 text-foreground-dim font-medium text-xs uppercase tracking-[0.15em]">TC &ge;</th>
                    <th className="text-left py-3 text-foreground-dim font-medium text-xs uppercase tracking-[0.15em]">Deviation</th>
                    <th className="text-left py-3 pr-7 sm:pr-9 text-foreground-dim font-medium text-xs uppercase tracking-[0.15em]">Normal</th>
                  </tr>
                </thead>
                <tbody>
                  {ILLUSTRIOUS_18.map((row, i) => (
                    <tr key={i} className="border-b border-rule/50 last:border-0">
                      <td className="py-2.5 px-7 sm:px-9 text-foreground font-mono text-xs tabular-nums">{row.index}</td>
                      <td className="py-2.5 text-center">
                        <span className={`font-semibold font-mono text-xs tabular-nums ${
                          row.tc >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {row.tc >= 0 ? '+' : ''}{row.tc}
                        </span>
                      </td>
                      <td className="py-2.5 text-foreground-muted text-xs">{row.play}</td>
                      <td className="py-2.5 pr-7 sm:pr-9 text-foreground-dim text-xs">{row.normal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-rule rounded-2xl px-7 py-7 sm:px-9 sm:py-9 space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-dim">How to Use Deviations</p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              First: master basic strategy perfectly. Then learn to keep the running count without
              thinking. Then practice true count conversion. Only then start memorizing deviations,
              starting from the top of this list (highest value first).
            </p>
            <p className="text-foreground-muted text-base sm:text-lg leading-relaxed">
              The top 3 deviations (insurance at TC+3, standing on 16v10 at TC&ge;0, and standing
              on 15v10 at TC+4) capture roughly half the total value of all index plays combined.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
