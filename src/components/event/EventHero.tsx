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
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <p
        className="text-sm uppercase tracking-widest mb-4 font-medium"
        style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
      >
        {formattedDate}
      </p>
      <h1
        className="text-4xl md:text-7xl font-bold mb-6 leading-tight"
        style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
      >
        {eventName}
      </h1>
      <p
        className="text-lg md:text-xl max-w-xl mb-10 opacity-80"
        style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
      >
        {theme.sections.tagline}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="#presentes"
          className="px-8 py-4 rounded-full font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body)" }}
        >
          {theme.sections.cta}
        </a>
        <a
          href="#rsvp"
          className="px-8 py-4 rounded-full font-semibold border-2 transition-transform hover:scale-105 active:scale-95"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Confirmar Presenca
        </a>
      </div>
    </section>
  );
}
