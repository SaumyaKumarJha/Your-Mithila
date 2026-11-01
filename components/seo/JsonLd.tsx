export function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "YourMithila",
    alternateName: "Your Mithila",
    url: "https://yourmithila.in",
    description:
      "Property and jobs platform for Madhubani and Mithila region, Bihar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://yourmithila.in/properties?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "YourMithila",
    url: "https://yourmithila.in",
    logo: "https://yourmithila.in/icon.svg",
    description:
      "Local property and job listing platform for Madhubani and Mithila region Bihar",
    areaServed: {
      "@type": "City",
      name: "Madhubani",
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madhubani",
      addressRegion: "Bihar",
      postalCode: "847211",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-70336-69971",
      contactType: "customer service",
      availableLanguage: ["Hindi", "English", "Maithili"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
    </>
  );
}
