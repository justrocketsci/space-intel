import { type ReactNode } from "react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Space Intel",
    template: "%s | Space Intel",
  },
  description:
    "The Bloomberg Terminal for Space. Unified intelligence platform for the $626B space economy — real-time data on launches, contracts, SEC filings, and funding.",
  keywords: ["space", "aerospace", "defense", "intelligence", "bloomberg", "terminal", "finance"],
  authors: [{ name: "Space Intel" }],
  creator: "Space Intel",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Space Intel — The Bloomberg Terminal for Space",
    description:
      "Unified intelligence platform for the $626B space economy. Real-time data on launches, contracts, filings, and funding.",
    siteName: "Space Intel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Space Intel — The Bloomberg Terminal for Space",
    description:
      "Unified intelligence platform for the $626B space economy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
