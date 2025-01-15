import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://app.aibtc.dev"),
  title: {
    default: "AIBTCDEV",
    template: "%s | AIBTCDEV",
  },
  description: "The Bitcoin DeFAI Console",
  keywords: ["Bitcoin", "AI", "Stacks", "L2", "Trading", "DAO"],
  authors: [{ name: "AIBTCDEV" }],
  openGraph: {
    title: "AIBTCDEV",
    description: "The Bitcoin DeFAI Console",
    type: "website",
    images: [
      {
        url: "https://app.aibtc.dev/logos/aibtcdev-avatar-1000px.png",
        width: 1000,
        height: 1000,
        alt: "AIBTCDEV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "https://app.aibtc.dev/logos/aibtcdev-pattern-1-with-text-social.png",
        alt: "AIBTC",
        width: 1200,
        height: 630,
      },
    ],
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
      className="h-full text-zinc-950 antialiased bg-zinc-950 dark:text-white"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body
        className={`h-full flex flex-col ${rocGroteskRegular.variable} ${rocGroteskWide.variable} ${rocGroteskExtraWide.variable} antialiased bg-zinc-950`}
      >
        <Providers>
          <AuthProvider>
            <main className="flex-1 flex flex-col h-full">{children}</main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
