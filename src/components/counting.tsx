'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import { createShoe, hiLoValue, cardValue, type Card } from '@/data/strategy';

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
  { index: '12 vs 4', tc: 0, play: 'Stand (TC >= 0)', normal: 'Stand' },
  { index: '12 vs 5', tc: -2, play: 'Stand', normal: 'Stand' },
  { index: '12 vs 6', tc: -1, play: 'Stand', normal: 'Stand' },
  { index: '13 vs 3', tc: -2, play: 'Hit', normal: 'Stand' },
];

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Card Counting</h2>
        <p className="text-foreground-muted text-sm">
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
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
        <div className="space-y-6">
          <div className="bg-surface border border-rule rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-foreground">The Hi-Lo System</h3>
            <p className="text-foreground-muted text-sm">
              Card counting tracks the ratio of high cards to low cards remaining in the shoe.
              When the deck is rich in 10s and Aces, the player has an advantage — more blackjacks,
              better doubles, and the dealer busts more often.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="text-emerald-400 text-2xl font-bold">+1</div>
                <div className="text-foreground-muted text-xs mt-1">2, 3, 4, 5, 6</div>
                <div className="text-foreground-dim text-xs">Low cards</div>
              </div>
              <div className="bg-foreground/5 border border-rule rounded-lg p-3">
                <div className="text-foreground-muted text-2xl font-bold">0</div>
                <div className="text-foreground-muted text-xs mt-1">7, 8, 9</div>
                <div className="text-foreground-dim text-xs">Neutral</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <div className="text-rose-400 text-2xl font-bold">-1</div>
                <div className="text-foreground-muted text-xs mt-1">10, J, Q, K, A</div>
                <div className="text-foreground-dim text-xs">High cards</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-rule rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Running Count → True Count</h3>
            <p className="text-foreground-muted text-sm">
              The running count alone doesn&apos;t account for how many cards remain. Divide the running count
              by the number of decks remaining to get the <strong className="text-foreground">true count</strong>.
              The true count is what drives your betting and playing decisions.
            </p>
            <div className="bg-background rounded-lg p-4 text-center border border-rule">
              <span className="text-foreground font-mono text-sm">
                True Count = Running Count / Decks Remaining
              </span>
            </div>
          </div>

          <div className="bg-surface border border-rule rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Betting Spread</h3>
            <p className="text-foreground-muted text-sm">
              Increase your bet when the true count is positive (advantage shifts to you).
              The bigger the true count, the larger the edge.
            </p>
            <div className="space-y-1.5 text-sm">
              {[
                { tc: 'TC ≤ 0', bet: '1 unit (minimum)', edge: 'House has edge' },
                { tc: 'TC +1', bet: '1-2 units', edge: 'Near break-even' },
                { tc: 'TC +2', bet: '2-4 units', edge: 'Player edge ~0.5%' },
                { tc: 'TC +3', bet: '4-8 units', edge: 'Player edge ~1%' },
                { tc: 'TC +4', bet: '8-12 units', edge: 'Player edge ~1.5%' },
                { tc: 'TC +5+', bet: 'Max bet', edge: 'Strong player edge' },
              ].map(row => (
                <div key={row.tc} className="flex items-center gap-3 py-1.5 border-b border-rule last:border-0">
                  <span className="text-foreground font-mono w-16 shrink-0">{row.tc}</span>
                  <span className="text-foreground-muted flex-1">{row.bet}</span>
                  <span className="text-foreground-dim text-xs">{row.edge}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-foreground-dim text-xs">
            Card counting is legal. Casinos may ask you to leave but it is not a crime.
            This trainer is for educational and mathematical purposes.
          </p>
        </div>
      )}

      {/* Practice section */}
      {activeSection === 'practice' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <div className="text-foreground-dim text-xs uppercase tracking-widest mb-1">Decks</div>
              <div className="flex gap-1">
                {[1, 2, 6, 8].map(d => (
                  <button
                    key={d}
                    onClick={() => setDeckCount(d)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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
              <div className="text-foreground-dim text-xs uppercase tracking-widest mb-1">Speed</div>
              <div className="flex gap-1">
                {SPEEDS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSpeed(s.ms)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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
            <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
              <input
                type="checkbox"
                checked={showValues}
                onChange={e => setShowValues(e.target.checked)}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-foreground-muted text-xs">Show Hi-Lo values</span>
            </label>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-foreground-dim">
              <span>{currentIndex} / {shoe.length} cards</span>
              <span>{Math.round(decksRemaining * 10) / 10} decks left</span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-rule">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current card */}
          <div className="flex flex-col items-center gap-3 py-4">
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div
                  key={`${currentIndex}-${currentCard.rank}-${currentCard.suit}`}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <PlayingCard rank={currentCard.rank} suit={currentCard.suit} size="lg" />
                  {showValues && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-lg font-bold ${
                        hiLoValue(currentCard.rank) > 0
                          ? 'text-emerald-400'
                          : hiLoValue(currentCard.rank) < 0
                          ? 'text-rose-400'
                          : 'text-foreground-muted'
                      }`}
                    >
                      {hiLoValue(currentCard.rank) > 0 ? '+1' : hiLoValue(currentCard.rank) < 0 ? '-1' : '0'}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <PlayingCard rank="A" suit="spades" size="lg" faceDown />
                  <div className="text-foreground-dim text-sm">Ready</div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={nextCard}
              disabled={currentIndex >= shoe.length || autoPlay}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-accent/80 hover:bg-accent text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Card
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              disabled={currentIndex >= shoe.length}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                autoPlay
                  ? 'bg-rose-500/80 hover:bg-rose-500 text-white'
                  : 'bg-surface border border-rule text-foreground hover:bg-foreground/10'
              }`}
            >
              {autoPlay ? 'Pause' : 'Auto'}
            </button>
            <button
              onClick={newShoe}
              className="px-4 py-3 rounded-lg font-semibold text-sm bg-surface border border-rule text-foreground-muted hover:text-foreground transition-colors"
            >
              New Shoe
            </button>
          </div>

          {/* Count check */}
          <div className="bg-surface border border-rule rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">What is the running count?</span>
              <button
                onClick={() => setShowCount(!showCount)}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
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
                className="flex-1 bg-background border border-rule rounded-lg px-3 py-2 text-foreground text-sm font-mono focus:outline-none focus:border-accent"
              />
              <button
                onClick={checkGuess}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-accent/80 hover:bg-accent text-background transition-colors"
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
                  className={`text-sm font-medium ${
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
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rule">
                <div>
                  <div className="text-foreground-dim text-xs">Running Count</div>
                  <div className="text-foreground text-lg font-bold font-mono">
                    {runningCount >= 0 ? '+' : ''}{runningCount}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-dim text-xs">True Count</div>
                  <div className="text-foreground text-lg font-bold font-mono">
                    {trueCount >= 0 ? '+' : ''}{Math.round(trueCount * 10) / 10}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deviations section */}
      {activeSection === 'deviations' && (
        <div className="space-y-4">
          <div className="bg-surface border border-rule rounded-lg p-5 space-y-3">
            <h3 className="font-semibold text-foreground">The Illustrious 18</h3>
            <p className="text-foreground-muted text-sm">
              Once you can count, you deviate from basic strategy based on the true count.
              These 18 plays capture most of the value from index plays. The first few
              (insurance, 16v10, 15v10) account for the majority of the gain.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-rule">
                  <th className="text-left py-2 text-foreground-muted font-medium text-xs">Hand</th>
                  <th className="text-center py-2 text-foreground-muted font-medium text-xs">TC ≥</th>
                  <th className="text-left py-2 text-foreground-muted font-medium text-xs">Deviation</th>
                  <th className="text-left py-2 text-foreground-muted font-medium text-xs">Normal</th>
                </tr>
              </thead>
              <tbody>
                {ILLUSTRIOUS_18.map((row, i) => (
                  <tr key={i} className="border-b border-rule/50 last:border-0">
                    <td className="py-2 text-foreground font-mono text-xs">{row.index}</td>
                    <td className="py-2 text-center">
                      <span className={`font-bold font-mono text-xs ${
                        row.tc >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {row.tc >= 0 ? '+' : ''}{row.tc}
                      </span>
                    </td>
                    <td className="py-2 text-foreground-muted text-xs">{row.play}</td>
                    <td className="py-2 text-foreground-dim text-xs">{row.normal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface border border-rule rounded-lg p-5 space-y-3">
            <h3 className="font-semibold text-foreground">How to Use Deviations</h3>
            <p className="text-foreground-muted text-sm">
              First: master basic strategy perfectly. Then learn to keep the running count without
              thinking. Then practice true count conversion. Only then start memorizing deviations,
              starting from the top of this list (highest value first).
            </p>
            <p className="text-foreground-muted text-sm">
              The top 3 deviations (insurance at TC+3, standing on 16v10 at TC≥0, and standing
              on 15v10 at TC+4) capture roughly half the total value of all index plays combined.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
