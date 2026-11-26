import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Funnel_Display } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { themeScript } from "@/lib/theme-script";
// All styles load once, from here (about 20 KB): route-level CSS would be preloaded by link prefetching on the other
// route and trip the browser's "preloaded but not used" warning. Order matters: the peak's rules come after home's.
import "./globals.css";
import "./home.css";
import "@/components/commit-peak.css";
import "./apps/apps.css";
import "./not-found.css";

// Funnel Display is variable (the whole weight axis loads; the site uses 500–700). Atkinson: the two weights in use.
const display = Funnel_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const text = Atkinson_Hyperlegible_Next({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-text", display: "swap", adjustFontFallback: false }); // no metric overrides exist for this family

export const metadata: Metadata = {
  title: "Juan Castillo",
  description: "I make apps for the gym, the race track and dinner plans.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
