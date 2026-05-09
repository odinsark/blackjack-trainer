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
      {/* Header */}
      <header className="border-b border-rule">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Image src="/mithryl-logo.png" alt="Mithryl Labs" width={140} height={47} className="opacity-60 mb-3" />
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">21</h1>
            <span className="text-foreground-dim text-sm tracking-wide">Strategy Trainer</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-rule bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-0">
            {TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`py-3 px-4 text-sm font-medium transition-colors relative ${
                  tab === t.value
                    ? 'text-foreground'
                    : 'text-foreground-dim hover:text-foreground-muted'
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

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {tab === 'train' && <Trainer />}
          {tab === 'chart' && <StrategyChart />}
          {tab === 'count' && <Counting />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rule py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-xs text-foreground-dim">
          <div className="flex items-center gap-2">
            <Image src="/mithryl-m.png" alt="" width={16} height={20} className="opacity-40" />
            <span>Mithryl Labs</span>
          </div>
          <span>S17 / DAS / LS — Multi-deck</span>
        </div>
      </footer>
    </div>
  );
}
