import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://sprint.aibtc.dev"),
  title: {
    default: "AIBTC",
    template: "%s | AIBTC",
  },
  description: "Compete with AI on Stacks, the leading Bitcoin L2",
  keywords: ["Bitcoin", "AI", "Stacks", "L2", "Trading"],
  authors: [{ name: "AIBTC Champions" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    title: "AIBTC",
    description: "Compete with AI on Stacks, the leading Bitcoin L2",
    type: "website",
    images: [
      {
        url: "logos/aibtcdev-avatar-1000px.png",
        width: 1000,
        height: 1000,
        alt: "AIBTC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["logos/aibtcdev-avatar-1000px.png"],
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
