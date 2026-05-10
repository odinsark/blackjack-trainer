import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "21 | Blackjack Strategy Trainer — Mithryl Labs",
  description:
    "Interactive blackjack basic strategy trainer and card counting practice. Master perfect play, Hi-Lo counting, and the Illustrious 18 deviations. Built by Mithryl Labs.",
  icons: {
    icon: "/mithryl-m.png",
    apple: "/mithryl-m.png",
  },
  openGraph: {
    title: "21 | Blackjack Strategy Trainer",
    description:
      "Master blackjack basic strategy and card counting with interactive drills. Reduce the house edge and gain a mathematical advantage.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
          <filter id="logo-glow-filter">
            <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="expanded" />
            <feGaussianBlur in="expanded" stdDeviation="1.5" result="blurred" />
            <feFlood floodColor="rgb(170,183,210)" floodOpacity="0.375" result="color" />
            <feComposite in="color" in2="blurred" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </svg>
        <div className="ambient-orbs" aria-hidden="true">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
