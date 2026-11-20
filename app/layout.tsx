import type { Metadata } from "next";
import localFont from "next/font/local";
import { CustomCursor } from "@/components/custom-cursor";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
import "./portfolio.css";
import "./studio.css";

const clashDisplay = localFont({
  src: "../public/fonts/ClashDisplay-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-clash-display",
});

const instrumentSerif = localFont({
  src: "../public/fonts/InstrumentSerif-Italic.ttf",
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument-serif",
});

const generalSans = localFont({
  src: "../public/fonts/GeneralSans-Medium.woff2",
  weight: "500",
  display: "swap",
  variable: "--font-general-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Soumen Mandal — Video Editor & Motion Designer",
    template: "%s | Soumen Mandal",
  },
  description:
    "Video Editor & Motion Designer based in Kolkata, India. Crafting compelling visuals, seamless edits, and motion experiences that bring ideas to life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`min-h-full flex flex-col ${clashDisplay.variable} ${instrumentSerif.variable} ${generalSans.variable}`}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="grow" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <CustomCursor />
      </body>
    </html>
  );
}
