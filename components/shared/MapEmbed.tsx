interface MapEmbedProps {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function MapEmbed({ address, latitude, longitude }: MapEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // ── Google Maps (when API key is available) ──────────────────────────────
  if (apiKey) {
    const hasCoords = latitude != null && longitude != null;
    const query = hasCoords
      ? `${latitude},${longitude}`
      : encodeURIComponent(`${address}, Madhubani, Bihar`);

    const src = hasCoords
      ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=17`
      : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=15`;

    return (
      <div className="space-y-2">
        <iframe
          title="Location Map"
          width="100%"
          height="280"
          className="rounded-xl border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={src}
          allowFullScreen
        />
        {hasCoords && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: "var(--primary)" }}
          >
            🧭 Get Directions on Google Maps
          </a>
        )}
      </div>
    );
  }

  // ── OpenStreetMap fallback (no API key needed) ───────────────────────────
  const hasCoords = latitude != null && longitude != null;

  if (hasCoords) {
    const lat = latitude!;
    const lon = longitude!;
    // OSM embed with exact coordinates
    const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005},${lat - 0.003},${lon + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lon}`;
    return (
      <div className="space-y-2">
        <iframe
          title="Location Map"
          width="100%"
          height="280"
          className="rounded-xl"
          style={{ border: "1px solid var(--border)" }}
          loading="lazy"
          src={osmSrc}
        />
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          🧭 Open in OpenStreetMap
        </a>
      </div>
    );
  }

  // No coordinates — show locality search link on Google Maps
  const mapsQuery = encodeURIComponent(`${address}, Bihar, India`);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <iframe
        title="Location Map"
        width="100%"
        height="280"
        className="rounded-xl border-0"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=14`}
      />
      <a
        href={`https://www.google.com/maps/search/${mapsQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs font-medium py-2 hover:underline"
        style={{ color: "var(--primary)", background: "var(--surface-alt)" }}
      >
        🧭 View on Google Maps
      </a>
    </div>
  );
}
