"use client";

interface PlaylistSectionProps {
  spotifyUrl?: string | null;
}

function extractSpotifyEmbedUrl(url: string): string | null {
  // Suporta:
  // https://open.spotify.com/playlist/3cEYpjA9oz...
  // https://open.spotify.com/album/...
  // https://open.spotify.com/track/...
  const match = url.match(/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
}

export function PlaylistSection({ spotifyUrl }: PlaylistSectionProps) {
  const embedUrl = spotifyUrl ? extractSpotifyEmbedUrl(spotifyUrl) : null;

  return (
    <section
      id="playlist"
      className="py-20 px-4"
      style={{ backgroundColor: "var(--color-secondary, #F59E0B)" + "22" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-4"></div>
        <h2
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          Playlist do Evento
        </h2>
        <p
          className="text-gray-500 mb-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          A trilha sonora perfeita para essa celebração
        </p>

        {embedUrl ? (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={embedUrl}
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: "none" }}
            />
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 border-dashed py-16 px-8"
            style={{ borderColor: "var(--color-primary)", opacity: 0.5 }}
          >
            <p
              className="text-lg font-medium"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
            >
              A playlist será divulgada em breve 
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
