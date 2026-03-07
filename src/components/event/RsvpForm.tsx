"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, PartyPopper, Heart } from "lucide-react";

interface RsvpFormProps {
  eventSlug: string;
}

export function RsvpForm({ eventSlug }: RsvpFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined">("confirmed");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) { setError("Informe seu nome"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, guestName, guestEmail, status, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao registrar presença"); return; }
      setDone(true);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="rsvp"
      className="py-20 px-4"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md mx-auto">
        <h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          Confirme sua Presença
        </h2>
        <p
          className="text-center mb-10 opacity-60"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
        >
          Sua confirmação é muito importante para nós!
        </p>

        {done ? (
          <div className="text-center space-y-4 py-16 rounded-2xl border" style={{ borderColor: `var(--color-primary)40`, backgroundColor: `var(--color-primary)0d` }}>
            <div className="flex justify-center mb-2">
              {status === "confirmed"
                ? <PartyPopper size={56} style={{ color: "var(--color-primary)" }} />
                : <Heart size={56} style={{ color: "var(--color-primary)" }} />}
            </div>
            <h3
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
            >
              {status === "confirmed" ? "Até logo!" : "Sentiremos sua falta!"}
            </h3>
            <p className="opacity-60" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
              {status === "confirmed"
                ? "Sua presença foi confirmada. Mal podemos esperar!"
                : "Obrigado por nos avisar!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Toggle vou / nao vou */}
            <div className="grid grid-cols-2 gap-3">
              {(["confirmed", "declined"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2",
                    status === s
                      ? "text-white border-transparent"
                      : "border-current bg-transparent"
                  )}
                  style={{
                    backgroundColor: status === s ? "var(--color-primary)" : "transparent",
                    color: status === s ? "#fff" : "var(--color-primary)",
                    borderColor: status === s ? "transparent" : "var(--color-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {s === "confirmed" ? <><CheckCircle2 size={16} /> Vou!</> : <><XCircle size={16} /> Não posso ir</>}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-name" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                Nome *
              </Label>
              <Input
                id="rsvp-name"
                type="text"
                placeholder="Seu nome completo"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-email" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                E-mail <span className="opacity-50 font-normal">(opcional)</span>
              </Label>
              <Input
                id="rsvp-email"
                type="email"
                placeholder="seu@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-message" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                Mensagem <span className="opacity-50 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="rsvp-message"
                placeholder="Deixe um recado carinhoso..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="bg-white/80 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full text-base py-6 font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {loading ? "Enviando..." : status === "confirmed" ? <><PartyPopper size={18} /> Confirmar Presença</> : "Enviar Resposta"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
