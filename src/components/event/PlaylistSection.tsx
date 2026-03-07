"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";

interface PlaylistSectionProps {
  spotifyUrl?: string | null;
}

function extractSpotifyEmbedUrl(url: string): string | null {
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
      style={{ backgroundColor: `var(--color-secondary, #F59E0B)18` }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <p
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-3 opacity-60"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
        >
          Trilha sonora
        </p>
        <h2
          className="text-3xl md:text-4xl font-extrabold mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          <span className="inline-flex items-center gap-2"><Music size={30} /> Playlist do Evento</span>
        </h2>
        <p
          className="mb-10 opacity-60"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
        >
          A trilha sonora perfeita para essa celebração
        </p>

        {embedUrl ? (
          <Card className="overflow-hidden shadow-xl border-0">
            <CardContent className="p-0">
              <iframe
                src={embedUrl}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ border: "none", display: "block" }}
                title="Playlist do evento"
              />
            </CardContent>
          </Card>
        ) : (
          <div
            className="rounded-2xl border-2 border-dashed py-16 px-8 text-center"
            style={{ borderColor: `var(--color-primary)60` }}
          >
            <Music size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--color-text)" }} />
            <p
              className="font-medium opacity-60"
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
