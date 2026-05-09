'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trainer } from '@/components/trainer';
import { StrategyChart } from '@/components/strategy-chart';
import { Counting } from '@/components/counting';

const TABS = [
  { value: 'train' as const, label: 'Train' },
  { value: 'chart' as const, label: 'Chart' },
  { value: 'count' as const, label: 'Count' },
] as const;

type Tab = typeof TABS[number]['value'];

export default function Home() {
  const [tab, setTab] = useState<Tab>('train');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-rule">
        <div className="max-w-[740px] mx-auto px-6 sm:px-10 py-8 sm:py-10 text-center">
          <span className="logo-glow mb-6 mx-auto">
            <Image
              src="/mithryl-logo.png"
              alt="Mithryl Labs"
              width={180}
              height={60}
            />
          </span>
          <h1 className="text-[clamp(1.875rem,4vw+0.5rem,3rem)] font-semibold text-foreground tracking-tight leading-[1.1]">
            21
          </h1>
          <p className="text-foreground-muted text-base sm:text-lg leading-relaxed mt-2 mx-auto max-w-[42ch]">
            Strategy Trainer
          </p>
        </div>
      </header>

      <nav className="border-b border-rule bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[740px] mx-auto px-6 sm:px-10">
          <div className="flex justify-center gap-1 sm:gap-2">
            {TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`py-3 px-3 sm:px-4 text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] font-medium transition-colors duration-200 relative rounded-sm ${
                  tab === t.value
                    ? 'text-foreground'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {t.label}
                {tab === t.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-[740px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          {tab === 'train' && <Trainer />}
          {tab === 'chart' && <StrategyChart />}
          {tab === 'count' && <Counting />}
        </div>
      </main>

      <footer className="border-t border-rule py-8">
        <div className="max-w-[740px] mx-auto px-6 sm:px-10 text-center text-xs text-foreground-dim">
          <span>&copy; {new Date().getFullYear()} Mithryl Labs</span>
        </div>
      </footer>
    </div>
  );
}
