import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, Fraunces, Bricolage_Grotesque, Space_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Additional display faces used only by the niche storefront templates
// (src/components/templates/) — each template pairs one of these against
// the base Inter body face so every niche reads as its own product.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "JKUAT Towers — Shop the whole building",
  description:
    "Search, compare, and order across every shop in JKUAT Towers. Vendors get an AI business assistant built in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3452FF",
          fontFamily: "var(--font-body)",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html
        lang="en"
        className={`${display.variable} ${body.variable} ${mono.variable} ${fraunces.variable} ${bricolage.variable} ${spaceMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-paper text-ink font-body">{children}</body>
      </html>
    </ClerkProvider>
  );
}
