import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { ThemeJson } from "@/types";

interface EventHeroProps {
  eventName: string;
  eventDate: Date;
  theme: ThemeJson;
}

export function EventHero({ eventName, eventDate, theme }: EventHeroProps) {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(eventDate);

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 py-20"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Decorative background orb */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Date chip */}
        <p
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold mb-6 px-4 py-2 rounded-full border"
          style={{
            color: "var(--color-primary)",
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--color-primary)22",
            fontFamily: "var(--font-body)",
          }}
        >
          <Calendar size={12} /> {formattedDate}
        </p>

        <h1
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          {eventName}
        </h1>

        <p
          className="text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed opacity-70"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
        >
          {theme.sections.tagline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full text-base px-8 shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              fontFamily: "var(--font-body)",
            }}
          >
            <a href="#presentes">Comprar Presente</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full text-base px-8 transition-transform hover:scale-105 active:scale-95"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            <a href="#rsvp">Confirmar Presença</a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <span className="text-xs" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>Role para baixo</span>
        <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1" style={{ borderColor: "var(--color-text)" }}>
          <div className="w-1 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-text)" }} />
        </div>
      </div>
    </section>
  );
}
