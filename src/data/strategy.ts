export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type Action = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'Rh';
export type SimpleAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

export type HandType = 'all' | 'hard' | 'soft' | 'pair';

export interface DrillHand {
  playerCards: [Card, Card];
  dealerCard: Card;
  handType: 'hard' | 'soft' | 'pair';
  playerTotal: number;
  dealerValue: number;
  correctAction: Action;
  label: string;
  pairValue?: number;
}

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
  return parseInt(rank);
}

function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function randomDealerCard(): Card {
  return { rank: RANKS[Math.floor(Math.random() * RANKS.length)], suit: randomSuit() };
}

function dealerIndex(dealerValue: number): number {
  return dealerValue === 11 ? 9 : dealerValue - 2;
}

// Multi-deck, S17, DAS, Late Surrender
// Rows indexed by player total, columns by dealer upcard [2,3,4,5,6,7,8,9,10,A]

const hardChart: Record<number, Action[]> = {
  5:  ['H','H','H','H','H','H','H','H','H','H'],
  6:  ['H','H','H','H','H','H','H','H','H','H'],
  7:  ['H','H','H','H','H','H','H','H','H','H'],
  8:  ['H','H','H','H','H','H','H','H','H','H'],
  9:  ['H','D','D','D','D','H','H','H','H','H'],
  10: ['D','D','D','D','D','D','D','D','H','H'],
  11: ['D','D','D','D','D','D','D','D','D','D'],
  12: ['H','H','S','S','S','H','H','H','H','H'],
  13: ['S','S','S','S','S','H','H','H','H','H'],
  14: ['S','S','S','S','S','H','H','H','H','H'],
  15: ['S','S','S','S','S','H','H','H','Rh','H'],
  16: ['S','S','S','S','S','H','H','Rh','Rh','Rh'],
  17: ['S','S','S','S','S','S','S','S','S','S'],
};

const softChart: Record<number, Action[]> = {
  13: ['H','H','H','D','D','H','H','H','H','H'],
  14: ['H','H','H','D','D','H','H','H','H','H'],
  15: ['H','H','D','D','D','H','H','H','H','H'],
  16: ['H','H','D','D','D','H','H','H','H','H'],
  17: ['H','D','D','D','D','H','H','H','H','H'],
  18: ['Ds','Ds','Ds','Ds','Ds','S','S','H','H','H'],
  19: ['S','S','S','S','S','S','S','S','S','S'],
  20: ['S','S','S','S','S','S','S','S','S','S'],
};

const pairChart: Record<number, Action[]> = {
  2:  ['P','P','P','P','P','P','H','H','H','H'],
  3:  ['P','P','P','P','P','P','H','H','H','H'],
  4:  ['H','H','H','P','P','H','H','H','H','H'],
  5:  ['D','D','D','D','D','D','D','D','H','H'],
  6:  ['P','P','P','P','P','H','H','H','H','H'],
  7:  ['P','P','P','P','P','P','H','H','H','H'],
  8:  ['P','P','P','P','P','P','P','P','P','P'],
  9:  ['P','P','P','P','P','S','P','P','S','S'],
  10: ['S','S','S','S','S','S','S','S','S','S'],
  11: ['P','P','P','P','P','P','P','P','P','P'],
};

export function getCorrectAction(
  playerTotal: number,
  isSoft: boolean,
  isPair: boolean,
  pairValue: number | null,
  dealerValue: number,
): Action {
  const idx = dealerIndex(dealerValue);
  if (isPair && pairValue !== null) return pairChart[pairValue][idx];
  if (isSoft) return softChart[playerTotal]?.[idx] ?? 'S';
  if (playerTotal >= 17) return 'S';
  if (playerTotal <= 4) return 'H';
  return hardChart[playerTotal]?.[idx] ?? 'H';
}

export function getPrimaryAction(action: Action, surrenderAllowed: boolean): SimpleAction {
  switch (action) {
    case 'H': return 'hit';
    case 'S': return 'stand';
    case 'D': return 'double';
    case 'Ds': return 'double';
    case 'P': return 'split';
    case 'Rh': return surrenderAllowed ? 'surrender' : 'hit';
  }
}

export function actionLabel(action: SimpleAction): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function dealerCardLabel(value: number): string {
  return value === 11 ? 'A' : String(value);
}

// Hand generation for trainer drills

const INTERESTING_HARD_TOTALS = [9, 10, 11, 12, 13, 14, 15, 16];
const BORING_HARD_TOTALS = [5, 6, 7, 8, 17];

function pickHardTotal(): number {
  if (Math.random() < 0.15) {
    return BORING_HARD_TOTALS[Math.floor(Math.random() * BORING_HARD_TOTALS.length)];
  }
  return INTERESTING_HARD_TOTALS[Math.floor(Math.random() * INTERESTING_HARD_TOTALS.length)];
}

function rankForValue(v: number): Rank {
  if (v >= 2 && v <= 9) return String(v) as Rank;
  const tens: Rank[] = ['10', 'J', 'Q', 'K'];
  return tens[Math.floor(Math.random() * tens.length)];
}

function generateHardHand(): { cards: [Card, Card]; total: number; label: string } {
  const total = pickHardTotal();
  let c1: number, c2: number;

  if (total <= 4) {
    c1 = 2; c2 = 2;
  } else if (total >= 20) {
    const tens: Rank[] = ['10', 'J', 'Q', 'K'];
    const r1 = tens[Math.floor(Math.random() * tens.length)];
    let r2 = tens[Math.floor(Math.random() * tens.length)];
    while (r2 === r1) r2 = tens[Math.floor(Math.random() * tens.length)];
    return {
      cards: [{ rank: r1, suit: randomSuit() }, { rank: r2, suit: randomSuit() }],
      total: 20,
      label: `Hard 20`,
    };
  } else {
    const minC1 = Math.max(2, total - 10);
    const maxC1 = Math.min(10, total - 2);
    c1 = minC1 + Math.floor(Math.random() * (maxC1 - minC1 + 1));
    c2 = total - c1;
    if (c1 === c2) {
      if (c1 < 10) { c1++; c2--; }
      else { c1 = 10; c2 = total - 10; }
    }
    if (c1 < 2 || c2 < 2 || c1 === c2) {
      c1 = Math.max(2, Math.min(10, Math.floor(total / 2) + 1));
      c2 = total - c1;
    }
  }

  return {
    cards: [
      { rank: rankForValue(c1), suit: randomSuit() },
      { rank: rankForValue(c2), suit: randomSuit() },
    ],
    total,
    label: `Hard ${total}`,
  };
}

function generateSoftHand(): { cards: [Card, Card]; total: number; label: string } {
  const otherValues = [2, 3, 4, 5, 6, 7, 8, 9];
  const other = otherValues[Math.floor(Math.random() * otherValues.length)];
  const total = 11 + other;
  return {
    cards: [
      { rank: 'A', suit: randomSuit() },
      { rank: rankForValue(other), suit: randomSuit() },
    ],
    total,
    label: `Soft ${total}`,
  };
}

function generatePairHand(): { cards: [Card, Card]; pairValue: number; label: string } {
  const pairValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const pv = pairValues[Math.floor(Math.random() * pairValues.length)];
  const rank = pv === 11 ? 'A' as Rank : rankForValue(pv);
  let rank2 = rank;
  if (pv === 10) rank2 = rank;
  return {
    cards: [
      { rank, suit: randomSuit() },
      { rank: rank2, suit: randomSuit() },
    ],
    pairValue: pv,
    label: pv === 11 ? 'Pair of A' : `Pair of ${rank}`,
  };
}

export function generateDrillHand(filter: HandType): DrillHand {
  const dealer = randomDealerCard();
  const dv = cardValue(dealer.rank);

  let handType: 'hard' | 'soft' | 'pair';
  if (filter === 'all') {
    const r = Math.random();
    handType = r < 0.4 ? 'hard' : r < 0.7 ? 'soft' : 'pair';
  } else {
    handType = filter as 'hard' | 'soft' | 'pair';
  }

  if (handType === 'pair') {
    const { cards, pairValue, label } = generatePairHand();
    return {
      playerCards: cards,
      dealerCard: dealer,
      handType: 'pair',
      playerTotal: pairValue === 11 ? 12 : pairValue * 2,
      dealerValue: dv,
      correctAction: getCorrectAction(pairValue * 2, false, true, pairValue, dv),
      label: `${label} vs ${dealerCardLabel(dv)}`,
      pairValue,
    };
  }

  if (handType === 'soft') {
    const { cards, total, label } = generateSoftHand();
    return {
      playerCards: cards,
      dealerCard: dealer,
      handType: 'soft',
      playerTotal: total,
      dealerValue: dv,
      correctAction: getCorrectAction(total, true, false, null, dv),
      label: `${label} vs ${dealerCardLabel(dv)}`,
    };
  }

  const { cards, total, label } = generateHardHand();
  return {
    playerCards: cards,
    dealerCard: dealer,
    handType: 'hard',
    playerTotal: total,
    dealerValue: dv,
    correctAction: getCorrectAction(total, false, false, null, dv),
    label: `${label} vs ${dealerCardLabel(dv)}`,
  };
}

// Chart data exports for the reference view
export const HARD_ROWS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
export const SOFT_ROWS = [13, 14, 15, 16, 17, 18, 19, 20];
export const PAIR_ROWS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const DEALER_COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function getHardAction(total: number, dealerVal: number): Action {
  if (total >= 17) return 'S';
  if (total <= 4) return 'H';
  return hardChart[total]?.[dealerIndex(dealerVal)] ?? 'H';
}

export function getSoftAction(total: number, dealerVal: number): Action {
  return softChart[total]?.[dealerIndex(dealerVal)] ?? 'S';
}

export function getPairAction(pairVal: number, dealerVal: number): Action {
  return pairChart[pairVal]?.[dealerIndex(dealerVal)] ?? 'H';
}

export function softRowLabel(total: number): string {
  return `A,${total - 11}`;
}

export function pairRowLabel(pairVal: number): string {
  if (pairVal === 11) return 'A,A';
  if (pairVal === 10) return 'T,T';
  return `${pairVal},${pairVal}`;
}

// Hi-Lo card counting
export function hiLoValue(rank: Rank): number {
  const v = cardValue(rank);
  if (v >= 2 && v <= 6) return 1;
  if (v >= 7 && v <= 9) return 0;
  return -1;
}

function hardExplanation(total: number, action: SimpleAction): string {
  if (total <= 8) return "Too low to stand or double. Hit to improve your hand.";
  if (total === 9) {
    if (action === 'double') return "9 doubles well against a stiff dealer who's likely to bust.";
    return "9 isn't strong enough to double here. Hit without extra risk.";
  }
  if (total === 10) {
    if (action === 'double') return "Hard 10 often draws to 20. Double while the dealer is vulnerable.";
    return "Don't double into a strong dealer upcard. Hit instead.";
  }
  if (total === 11) return "11 is the best doubling hand — any face card makes 21.";
  if (total === 12) {
    if (action === 'stand') return "Dealer's stiff card means they bust often. Don't risk busting yourself.";
    return "12 only busts on a 10-value card. Low risk to hit, and the dealer likely has a made hand.";
  }
  if (total >= 13 && total <= 16) {
    if (action === 'surrender') return `${total} loses more than half the time here. Surrender saves half your bet.`;
    if (action === 'stand') return "Dealer's stiff card means they bust ~40% of the time. Stand and let them take the risk.";
    return "Dealer likely has 17+ already. Standing loses more than the bust risk of hitting.";
  }
  return "17+ always stands. Bust risk far outweighs any improvement.";
}

function softExplanation(total: number, action: SimpleAction): string {
  if (total >= 19) return `Soft ${total} is strong enough to stand against any dealer card.`;
  if (total === 18) {
    if (action === 'double') return "Soft 18 doubles well against stiff dealers — press your advantage while you can't bust.";
    if (action === 'stand') return "Soft 18 beats the dealer's likely 17. Stand.";
    return "Soft 18 isn't strong enough vs dealer 9+. Hit — you can't bust and might improve.";
  }
  if (total === 17) {
    if (action === 'double') return "Soft 17 is weak as a final hand but doubles well against stiff dealers.";
    return "Soft 17 can't bust. Hit to improve — 17 loses to most dealer hands.";
  }
  if (action === 'double') return `Soft ${total} against a weak dealer — double to press your edge while you can't bust.`;
  return `Soft ${total} can't bust. Hit to improve — standing this low loses too often.`;
}

function pairExplanation(pv: number, action: SimpleAction): string {
  if (pv === 11) return "Always split aces. Each ace has a strong chance of drawing to 21.";
  if (pv === 8) return "16 is the worst total in blackjack. Split to start two better hands from 8.";
  if (pv === 10) return "20 is too strong to break up. Stand and take the near-certain win.";
  if (pv === 5) {
    if (action === 'double') return "Never split 5s — treat as hard 10 and double while the dealer is vulnerable.";
    return "Treat 5,5 as hard 10. Don't double into dealer strength, just hit.";
  }
  if (pv === 9) {
    if (action === 'split') return "Two 9s play better than standing on 18 against this dealer.";
    return "18 already beats this dealer's likely total. No need to break up a winning hand.";
  }
  if (pv === 4) {
    if (action === 'split') return "Split 4s only against the weakest dealers (5-6) where doubling after split adds value.";
    return "8 is too low to get value from splitting. Hit the combined hand.";
  }
  if (pv === 6) {
    if (action === 'split') return "Split 6s against stiff dealers. Each 6 can build a hand while the dealer busts.";
    return "Against a strong dealer, 6s don't split well. Hit the combined 12.";
  }
  if (pv === 7) {
    if (action === 'split') return "Split 7s against 2-7. Each 7 starts better than the combined 14.";
    return "14 is weak, but 7s don't split well against strong dealers. Hit instead.";
  }
  if (action === 'split') return "Split low pairs against weak-to-medium dealers with DAS available.";
  return "Against a strong dealer, low pairs aren't worth splitting. Hit instead.";
}

export function getExplanation(hand: DrillHand, correctAction: SimpleAction): string {
  if (hand.handType === 'pair' && hand.pairValue != null) {
    return pairExplanation(hand.pairValue, correctAction);
  }
  if (hand.handType === 'soft') {
    return softExplanation(hand.playerTotal, correctAction);
  }
  return hardExplanation(hand.playerTotal, correctAction);
}

export function createShoe(deckCount: number): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const rank of RANKS) {
      for (const suit of SUITS) {
        shoe.push({ rank, suit });
      }
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}
