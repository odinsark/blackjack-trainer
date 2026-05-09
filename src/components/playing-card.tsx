'use client';

import type { Rank, Suit } from '@/data/strategy';

const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

function isRed(suit: Suit) {
  return suit === 'hearts' || suit === 'diamonds';
}

export function PlayingCard({
  rank,
  suit,
  size = 'md',
  faceDown = false,
}: {
  rank: Rank;
  suit: Suit;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}) {
  const dims = {
    sm: 'w-11 h-16 text-xs',
    md: 'w-16 h-[5.5rem] text-base',
    lg: 'w-[5.5rem] h-32 text-lg',
  }[size];

  const suitSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  if (faceDown) {
    return (
      <div
        className={`${dims} rounded-xl border border-white/10 flex items-center justify-center shadow-xl shadow-black/40`}
        style={{ background: 'linear-gradient(135deg, oklch(0.3 0.06 250), oklch(0.18 0.04 260))' }}
      >
        <div className="w-[70%] h-[75%] rounded-lg border border-white/10" style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, oklch(0.35 0.05 250) 3px, oklch(0.35 0.05 250) 4px)',
        }} />
      </div>
    );
  }

  const color = isRed(suit) ? 'text-red-500' : 'text-gray-800';

  return (
    <div className={`${dims} rounded-xl bg-white shadow-xl shadow-black/40 flex flex-col justify-between p-2 select-none border border-white/80`}>
      <div className={`${color} font-bold leading-none flex items-center gap-px`}>
        <span>{rank}</span>
        <span className="text-[0.7em]">{SUIT_SYMBOL[suit]}</span>
      </div>
      <div className={`${color} ${suitSize} text-center leading-none`}>
        {SUIT_SYMBOL[suit]}
      </div>
      <div className={`${color} font-bold leading-none flex items-center gap-px self-end rotate-180`}>
        <span>{rank}</span>
        <span className="text-[0.7em]">{SUIT_SYMBOL[suit]}</span>
      </div>
    </div>
  );
}
