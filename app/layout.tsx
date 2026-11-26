import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./stars.css";

const DESCRIPTION =
  "jcooperkai is Cooper (Jeffery Eckert), an agentic engineer in Florida, USA. Head of Product & Engineering at Hyperlapse. Projects, skills, resume and live GitHub activity.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jcooperkai.com"),
  title: "jcooperkai, Agentic Engineer",
  description: DESCRIPTION,
  applicationName: "jcooperkai",
  authors: [{ name: "jcooperkai", url: "https://jcooperkai.com/" }],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/assets/icon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon-48.png?v=2", sizes: "48x48", type: "image/png" },
      { url: "/assets/favicon-96.png?v=2", sizes: "96x96", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/assets/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    title: "jcooperkai, Agentic Engineer",
    url: "/",
    siteName: "jcooperkai",
    images: [{ url: "/assets/share.png", type: "image/png", width: 1200, height: 630, alt: "The JC logo above jcooperkai, Agentic Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "jcooperkai, Agentic Engineer",
    images: ["/assets/share.png"],
  },
  robots: { index: true, follow: true },
};

/* Security: a fixed constant. No request data or user input reaches it, and "<" is escaped so it
   can never close the script tag. */
const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://jcooperkai.com/#website",
      url: "https://jcooperkai.com/",
      name: "jcooperkai",
      description: DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": "https://jcooperkai.com/#person" },
    },
    {
      "@type": "ProfilePage",
      "@id": "https://jcooperkai.com/#profile",
      url: "https://jcooperkai.com/",
      name: "jcooperkai, Agentic Engineer",
      isPartOf: { "@id": "https://jcooperkai.com/#website" },
      dateModified: "2026-11-17",
      mainEntity: { "@id": "https://jcooperkai.com/#person" },
      primaryImageOfPage: "https://jcooperkai.com/assets/share.png",
    },
    {
      "@type": "Person",
      "@id": "https://jcooperkai.com/#person",
      name: "Jeffery Eckert",
      alternateName: ["Cooper", "jcooperkai", "Cooper E."],
      description: DESCRIPTION,
      jobTitle: "Head of Product & Engineering",
      hasOccupation: { "@type": "Occupation", name: "Agentic Engineer" },
      url: "https://jcooperkai.com/",
      image: "https://jcooperkai.com/assets/jc-avatar.png",
      email: "mailto:jcooperkai@gmail.com",
      address: { "@type": "PostalAddress", addressRegion: "FL", addressCountry: "US" },
      homeLocation: { "@type": "Place", name: "Florida, USA" },
      worksFor: [
        { "@type": "Organization", name: "Hyperlapse", url: "https://hyperlapse.com/" },
      ],
      knowsAbout: [
        "Agentic software engineering",
        "Machine learning",
        "Neural networks",
        "Reinforcement learning",
        "Computer vision",
        "Self-driving and motion planning",
        "Autonomous drones",
        "Operating systems",
        "Database engines",
        "Python",
        "C++",
        "TypeScript",
        "Rust",
      ],
      subjectOf: { "@type": "DigitalDocument", name: "Resume", url: "https://jcooperkai.com/resume" },
      sameAs: ["https://github.com/jcooperkai-sys", "https://x.com/jcooperkai"],
    },
  ],
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
