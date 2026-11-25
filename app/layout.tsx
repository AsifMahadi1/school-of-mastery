import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

/** Headings — BBH Bartle (wide uppercase display). */
const bbhBartle = localFont({
  src: [{ path: "../fonts/bbh-bartle.woff2", weight: "400", style: "normal" }],
  variable: "--font-bbh-bartle",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Script / signature words — Bastliga One. */
const bastligaOne = localFont({
  src: [{ path: "../fonts/bastliga-one.ttf", weight: "400", style: "normal" }],
  variable: "--font-bastliga",
  display: "swap",
  fallback: ["ui-serif", "serif"],
});

/** Body — Jost (variable, 100–900 + italics). */
const jost = localFont({
  src: [
    { path: "../fonts/jost-variable.ttf", weight: "100 900", style: "normal" },
    { path: "../fonts/jost-italic-variable.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-jost",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description:
    "The School of Mastery — an English course that helps you refine your English and redefine your life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bbhBartle.variable} ${bastligaOne.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full bg-black text-white antialiased">{children}</body>
    </html>
  );
}
