import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { ConceptNotice } from "@/components/ConceptNotice";
import { SiteHeader } from "@/components/SiteHeader";
import { Providers } from "./providers";
import "./globals.css";

// Temporary typefaces: HIP's actual fonts could not be verified. See docs/BRAND_AUDIT.md.
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const heading = Inter_Tight({ variable: "--font-heading", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Impact Start · Discover what your experience could make possible", template: "%s · Impact Start" },
  description:
    "An independent concept prototype: an interactive career-impact discovery experience for experienced professionals, created for a High Impact Professionals job application.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b2a4a", // mirrors --brand-primary; metadata cannot read CSS variables
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${body.variable} ${heading.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-brand-accent px-4 py-2 font-semibold text-brand-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="min-h-dvh">
            {children}
          </main>
          <ConceptNotice />
        </Providers>
      </body>
    </html>
  );
}
