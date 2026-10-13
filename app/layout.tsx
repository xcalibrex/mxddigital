import type { Metadata, Viewport } from "next";
import { DM_Sans, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({ subsets: ["latin"], weight: ["400"], variable: "--font-display", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mxddigital.com.au";
const description = "Ads that pay for themselves. Websites that convert. Digital marketing for Australian trade businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MXD Digital | More leads for the trades",
  description,
  alternates: { canonical: "/" },
  openGraph: { title: "MXD Digital | More leads for the trades", description, url: "/", siteName: "MXD Digital", locale: "en_AU", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
