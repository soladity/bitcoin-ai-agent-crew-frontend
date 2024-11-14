import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ApplicationLayout } from "./application-layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://sprint.aibtc.dev"),
  title: {
    default: "AIBTC Champions Sprint",
    template: "%s | AIBTC Champions Sprint",
  },
  description: "Compete with AI on Stacks, the leading Bitcoin L2",
  keywords: ["Bitcoin", "AI", "Stacks", "L2", "Trading"],
  authors: [{ name: "AIBTC Champions" }],
  openGraph: {
    title: "AIBTC Champions Sprint",
    description: "Compete with AI on Stacks, the leading Bitcoin L2",
    type: "website",
    images: [
      {
        url: "logos/aibtcdev-champions-sprint-trading-series-800px.png",
        width: 800,
        height: 800,
        alt: "AIBTC Champions Sprint",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["logos/aibtcdev-champions-sprint-trading-series-800px.png"],
  },
};

const rocGroteskRegular = localFont({
  src: [
    {
      path: "./fonts/RocGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/RocGrotesk-Regular.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-roc-grotesk-regular",
  display: "swap",
});

const rocGroteskWide = localFont({
  src: [
    {
      path: "./fonts/RocGrotesk-WideMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/RocGrotesk-WideMedium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-roc-grotesk-wide",
  display: "swap",
});

const rocGroteskExtraWide = localFont({
  src: [
    {
      path: "./fonts/RocGrotesk-ExtraWideMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/RocGrotesk-ExtraWideMedium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-roc-grotesk-extra-wide",
  display: "swap",
});

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body
        className={`${rocGroteskRegular.variable} ${rocGroteskWide.variable} ${rocGroteskExtraWide.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
