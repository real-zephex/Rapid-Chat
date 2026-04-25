import "./globals.css";

import { ModelProvider } from "@/context/ModelContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import MainContent from "@/ui/main-content";
import Sidebar from "@/ui/sidebar";
import Toast from "@/ui/toast";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Public_Sans, Syne } from "next/font/google";
import { Suspense } from "react";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const syne = Syne({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Rapid Chat",
    template: "%s | Rapid Chat",
  },
  description:
    "A fast, modern AI chat interface supporting multiple AI models. Experience lightning-fast conversations with cutting-edge AI technology.",
  keywords: [
    "AI chat",
    "artificial intelligence",
    "chatbot",
    "GPT",
    "Claude",
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
    title: "Rapid Chat",
    description:
      "Experience lightning-fast conversations with multiple AI models in one unified interface. Chat with GPT, Llama, and more.",
    siteName: "Rapid Chat",
    images: [
      {
        url: "https://fafb.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Rapid Chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapid Chat",
    description:
      "Experience lightning-fast conversations with multiple AI models in one unified interface.",
    images: ["https://fafb.vercel.app/logo.png"],
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
  manifest: "https://fafb.vercel.app/manifest.json",
  category: "technology",
  classification: "AI Chat Application",
  applicationName: "Rapid Chat",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  // other: {
  //   "google-site-verification": "your-verification-code", // Replace with actual verification code
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rapid Chat",
    description:
      "A fast, modern AI chat interface supporting multiple AI models. Experience lightning-fast conversations with cutting-edge AI technology.",
    url: "https://fafb.vercel.app",
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Multi-model AI chat support",
      "Real-time streaming responses",
      "Privacy-first local storage",
      "Image and PDF processing",
      "Audio transcription",
      "Multiple AI providers (Groq, OpenRouter)",
    ],
    author: {
      "@type": "Organization",
      name: "Rapid AI Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Rapid AI",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const storedTheme = localStorage.getItem("rapid-chat-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();`,
          }}
        />
      </head>
      <Analytics />
      <GoogleAnalytics gaId="G-8F9MJ8CCTN" />
      <body
        className={`${publicSans.variable} ${syne.variable} ${plexMono.variable} m-0 h-full overflow-hidden bg-background font-sans text-text-primary antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <SidebarProvider>
              <ModelProvider>
                <Suspense fallback={null}>
                  <Sidebar />
                </Suspense>
                <MainContent>{children}</MainContent>
                <Toast />
              </ModelProvider>
            </SidebarProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
