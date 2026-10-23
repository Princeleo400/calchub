import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import {
  GoogleAnalyticsPageViews,
  GoogleTags,
} from "@/components/analytics/GoogleTags";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { adsenseClient } from "@/lib/googleConfig";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Lets AdSense confirm you own the site when you apply.
  ...(adsenseClient
    ? { other: { "google-adsense-account": adsenseClient } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

// Runs before first paint: saved choice wins, otherwise follow the OS.
const themeScript = `(function(){try{var savedTheme=localStorage.getItem("calchub_theme");var prefersDark=savedTheme?savedTheme==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(prefersDark)document.documentElement.classList.add("dark")}catch(error){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <GoogleTags />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <GoogleAnalyticsPageViews />
      </body>
    </html>
  );
}
