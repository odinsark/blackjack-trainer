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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
