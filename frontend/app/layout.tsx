import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/site";
import ContactModal from "@/components/Contact";
import { Analytics } from "@vercel/analytics/next"
import { PostHogProvider } from "@/providers/posthog";
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Klyro",
    "Klyro: Discover Talent backed by Proof of Work",
    "Klyro: Find Talent",
    "Klyro: Find Builders",
    "Klyro: Find Builders Intelligently",
  ],
  authors: [
    {
      name: "Nisarg Thakkar and Mohit Bhat",
      url: "https://www.nisargthakkar.co/",
    },
  ],
  creator: "",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "Nisarg Thakkar and Mohit Bhat",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen dark`}
      >
        <ThemeProvider>
          <Navbar />
          <PostHogProvider>
            {children}
            <SpeedInsights />
          </PostHogProvider>
          <Analytics/>
        </ThemeProvider>
      </body>
    </html>
  );
}
