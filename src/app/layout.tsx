import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Sidebar from "@/ui/sidebar";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SidebarProvider } from "@/context/SidebarContext";
import { ModelProvider } from "@/context/ModelContext";
import MainContent from "@/ui/main-content";
import { ToastProvider } from "@/context/ToastContext";
import Toast from "@/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
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
    title: "Rapid Chat",
    description:
      "Experience lightning-fast conversations with multiple AI models in one unified interface. Chat with Gemini, GPT, Llama, and more.",
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
      "Multiple AI providers (Google, Groq, OpenAI, OpenRouter)",
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <Analytics />
      <GoogleAnalytics gaId="G-8F9MJ8CCTN" />
      <body
        className={`${notoSans.className} ${inter.className} font-sans antialiased m-1 h-full`}
      >
        <ToastProvider>
          <SidebarProvider>
            <ModelProvider>
              <Sidebar />
              <MainContent>{children}</MainContent>
              <Toast />
            </ModelProvider>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
