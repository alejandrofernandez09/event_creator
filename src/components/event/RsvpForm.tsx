"use client";

import { useState } from "react";

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
    if (!guestName.trim()) {
      setError("Informe seu nome");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, guestName, guestEmail, status, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao registrar presenca");
        return;
      }
      setDone(true);
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="rsvp" className="py-20 px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-md mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          Confirme sua Presenca
        </h2>
        <p className="text-center text-gray-500 mb-10" style={{ fontFamily: "var(--font-body)" }}>
          Sua confirmacao e muito importante para nos!
        </p>

        {done ? (
          <div className="text-center space-y-4 py-12">
            <div className="text-6xl">{status === "confirmed" ? "" : ""}</div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {status === "confirmed" ? "Ate logo!" : "Sentiremos sua falta!"}
            </h3>
            <p className="text-gray-500" style={{ fontFamily: "var(--font-body)" }}>
              {status === "confirmed"
                ? "Sua presenca foi confirmada. Mal podemos esperar!"
                : "Obrigado por nos avisar!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 bg-white"
            />
            <input
              type="email"
              placeholder="Seu e-mail (opcional)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white"
            />
            <textarea
              placeholder="Deixe uma mensagem (opcional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white resize-none"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("confirmed")}
                className="flex-1 py-3 rounded-full font-semibold text-sm transition-all border-2"
                style={{
                  backgroundColor: status === "confirmed" ? "var(--color-primary)" : "transparent",
                  color: status === "confirmed" ? "white" : "var(--color-primary)",
                  borderColor: "var(--color-primary)",
                }}
              >
                 Vou comparecer
              </button>
              <button
                type="button"
                onClick={() => setStatus("declined")}
                className="flex-1 py-3 rounded-full font-semibold text-sm transition-all border-2 border-gray-300"
                style={{
                  backgroundColor: status === "declined" ? "#6B7280" : "transparent",
                  color: status === "declined" ? "white" : "#6B7280",
                }}
              >
                 Nao poderei ir
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Registrando..." : "Confirmar"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
