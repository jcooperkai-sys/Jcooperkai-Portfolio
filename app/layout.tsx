import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./stars.css";

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

/* Security: a fixed constant. No request data or user input reaches it, and "<" is escaped so it
   can never close the script tag. */
const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://jcooperkai.com/#person",
  name: "Cooper E.",
  alternateName: "jcooperkai",
  jobTitle: "Agentic Engineer",
  url: "https://jcooperkai.com/",
  image: "https://jcooperkai.com/assets/og.png",
  email: "mailto:jcooperkai@gmail.com",
  address: { "@type": "PostalAddress", addressRegion: "FL", addressCountry: "US" },
  worksFor: { "@type": "Organization", name: "Webbify", url: "https://webbify.build/" },
  sameAs: ["https://github.com/jcooperkai-sys", "https://x.com/jcooperkai"],
}).replace(/</g, "\\u003c");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
        {children}
      </body>
    </html>
  );
}
