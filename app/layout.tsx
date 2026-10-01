import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jcooperkai.com"),
  title: "jcooperkai, Agentic Engineer",
  description:
    "I'm jcooperkai, an agentic engineer in San Diego. My company Webbify, the projects I've made public on GitHub, and how to reach me.",
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
    description: "My company, my open-source projects, and how to reach me.",
    url: "/",
    siteName: "jcooperkai",
  },
  twitter: {
    card: "summary",
    title: "jcooperkai, Agentic Engineer",
    description: "My company, my open-source projects, and how to reach me.",
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
