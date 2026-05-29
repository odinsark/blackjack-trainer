# 21 - Blackjack Strategy Trainer

A blackjack basic strategy trainer and card counting practice tool. Drill every decision at the table until it's automatic.

**[Live demo](https://blackjack.mithryllabs.com)**

## What it does

Three modes:

- **Train** -- Deals random hands and asks you to pick the correct basic strategy play (hit, stand, double, split, surrender). Tracks accuracy, streak, and explains every wrong answer. Filter by hand type (hard, soft, pairs) to focus on weak spots.
- **Chart** -- Full basic strategy reference charts for hard totals, soft totals, and pairs. Multi-deck, S17, DAS, late surrender rules.
- **Count** -- Hi-Lo card counting practice. Cards deal from a 6-deck shoe at adjustable speed (slow through casino pace). Toggle the running count on/off to test yourself. Includes the Illustrious 18 deviation index for true-count-based plays.

Strategy tables are multi-deck, dealer stands on soft 17, double after split allowed, late surrender allowed.

## Tech stack

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Host | Vercel |

No backend, no API keys, no database. Everything runs client-side.

## Install

```bash
git clone https://github.com/mithryl/blackjack-trainer.git
cd blackjack-trainer
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Deploy

Push to `main` and Vercel auto-deploys. Or manually:

```bash
npx vercel --prod
```

No environment variables required.

## License

MIT -- see [LICENSE](LICENSE).
