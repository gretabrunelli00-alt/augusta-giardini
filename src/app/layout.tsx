import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCollection, siteUrl } from "@/lib/content";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ece7db",
};

export function generateMetadata(): Metadata {
  const { site } = getCollection();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: "Augusta Architettura Giardini — giardini e terrazze sul Lago d’Iseo e a Bergamo",
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    authors: [{ name: site.owner }],
    openGraph: { type: "website", locale: site.locale, siteName: site.name },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

function localBusinessLd() {
  const { site } = getCollection();
  const a = site.contact.address;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${siteUrl()}/#studio`,
    name: site.name,
    alternateName: site.owner,
    description: site.description,
    url: siteUrl(),
    telephone: site.contact.phoneE164,
    vatID: site.contact.vatNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.city,
      addressRegion: a.province,
      addressCountry: a.country,
    },
    areaServed: [
      { "@type": "Place", name: "Lago d’Iseo (Basso Sebino)" },
      { "@type": "City", name: "Bergamo" },
    ],
    knowsAbout: ["progettazione di giardini", "progettazione di terrazze e balconi", "giardini pensili", "roof garden"],
    sameAs: [site.instagram],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{var q=location.search;if(/[?&]review=1/.test(q))localStorage.setItem('review','1');if(/[?&]review=0/.test(q))localStorage.removeItem('review');if(localStorage.getItem('review'))document.documentElement.setAttribute('data-review','')}catch(e){}",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd()) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
