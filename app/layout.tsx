import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jcooperkai.com"),
  title: "jcooperkai, Agentic Engineer",
  applicationName: "jcooperkai",
  authors: [{ name: "jcooperkai", url: "https://jcooperkai.com/" }],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/assets/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/assets/favicon-192.png",
  },
  openGraph: {
    type: "website",
    title: "jcooperkai, Agentic Engineer",
    url: "/",
    siteName: "jcooperkai",
    images: [{ url: "/assets/og.png", width: 1200, height: 630, alt: "The JC logo above jcooperkai, Agentic Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "jcooperkai, Agentic Engineer",
    images: ["/assets/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#404147",
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
