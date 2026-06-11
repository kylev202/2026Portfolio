import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import { profile, system } from "@/lib/content";

// Mechanical mono — carries the "machine": chrome, labels, data, the headline.
// (Variable font: full weight range available via font-weight utilities.)
const mono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Humanist grotesk — readable body prose + section headings.
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const title = `${profile.name} — ${profile.role}`;
const description = profile.intro;

export const viewport: Viewport = {
  themeColor: "#0d0f14",
  colorScheme: "dark",
  // Draw under notches / rounded corners so `env(safe-area-inset-*)` works; the
  // chrome bars and dock pad themselves out of the unsafe regions.
  viewportFit: "cover",
};

export const metadata: Metadata = {
  // Absolute base for resolving the generated OG/Twitter image. Set
  // NEXT_PUBLIC_SITE_URL to your real domain at deploy; falls back to localhost.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: title,
    template: `%s — ${profile.name}`,
  },
  description,
  applicationName: system.name,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
