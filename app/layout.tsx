import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jcooperkai.com"),
  title: "Cooper E.’s AI Lab — jcooperkai",
  description:
    "Cooper E. researches agentic AI systems, tool use, memory, and human-centered controls from San Diego.",
  applicationName: "Cooper E.’s AI Lab",
  authors: [{ name: "Cooper E.", url: "https://jcooperkai.com/" }],
  keywords: [
    "AI research",
    "Cooper E.",
    "jcooperkai",
    "AI agents",
    "agentic systems",
    "machine learning",
    "research papers",
    "artificial intelligence",
    "portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/assets/jc-wordmark.png",
    shortcut: "/assets/jc-wordmark.png",
  },
  openGraph: {
    type: "website",
    title: "Cooper E.’s AI Lab",
    description:
      "AI research, agentic systems, and open experiments from San Diego.",
    url: "/",
    siteName: "jcooperkai",
  },
  twitter: {
    card: "summary",
    title: "Cooper E.’s AI Lab",
    description:
      "AI research, agentic systems, and open experiments from San Diego.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020402",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
