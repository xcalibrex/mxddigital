import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Unbounded } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const metaPixelId = "4722452004656111";

const display = Unbounded({ subsets: ["latin"], weight: ["400"], variable: "--font-display", display: "swap" });
// Hero promo kinetic type only
const promo = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-promo", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mxddigital.com";
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
    <html lang="en-AU" className={`${display.variable} ${body.variable} ${promo.variable}`}>
      <body>
        {children}
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');
fbq('track','PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
        </noscript>
      </body>
    </html>
  );
}
