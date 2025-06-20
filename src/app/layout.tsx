import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/ui/sidebar";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Rapid AI - Rapid AI Chat Interface",
    template: "%s | Rapid AI",
  },
  description:
    "A fast, modern AI chat interface supporting multiple AI models. Experience lightning-fast conversations with cutting-edge AI technology.",
  keywords: [
    "AI chat",
    "artificial intelligence",
    "chatbot",
    "GPT",
    "Claude",
    "Gemini",
    "machine learning",
    "conversational AI",
    "fast AI",
    "AI assistant",
  ],
  authors: [{ name: "Rapid AI Team" }],
  creator: "Rapid AI",
  publisher: "Rapid AI",
  metadataBase: new URL("https://fafb.vercel.app"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Rapid AI - Rapid AI Chat Interface",
    description:
      "Experience lightning-fast conversations with multiple AI models in one unified interface. Chat with GPT, Claude, Gemini, and more.",
    siteName: "Rapid AI",
    images: [
      {
        url: "https://fafb.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Rapid AI - Rapid AI Chat Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapid AI - Rapid AI Chat Interface",
    description:
      "Experience lightning-fast conversations with multiple AI models in one unified interface.",
    images: ["https://fafb.vercel.app/logo.png"],
    creator: "@fastai", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "https://fafb.vercel.app/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "https://fafb.vercel.app/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://fafb.vercel.app/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "https://fafb.vercel.app/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "https://fafb.vercel.app/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "https://fafb.vercel.app/manifest.json", // You might want to create this
  category: "technology",
  classification: "AI Chat Application",
  applicationName: "Rapid AI",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <GoogleAnalytics gaId="G-8F9MJ8CCTN" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased m-1.5 flex flex-row h-full gap-2`}
      >
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
