"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemeJson } from "@/types";

const DEFAULT_THEME_PREVIEW: ThemeJson = {
  colors: { primary: "#7C3AED", secondary: "#F59E0B", background: "#FAFAFA", text: "#1F2937", accent: "#EC4899" },
  fonts: { heading: "Playfair Display", body: "Inter" },
  sections: { headline: "Celebre este momento especial", cta: "Ver presentes", tagline: "Um dia unico merece uma celebracao inesquecivel." },
};

export default function CriarEventoPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "generating" | "preview">("form");

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [themeDescription, setThemeDescription] = useState("");

  const [generatedTheme, setGeneratedTheme] = useState<ThemeJson | null>(null);
  const [themeSource, setThemeSource] = useState<"ai" | "default">("default");
  const [themeWarning, setThemeWarning] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateTheme() {
    if (!themeDescription.trim()) {
      setGeneratedTheme(DEFAULT_THEME_PREVIEW);
      setThemeSource("default");
      setStep("preview");
      return;
    }
    setStep("generating");
    try {
      const res = await fetch("/api/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: themeDescription }),
      });
      const data = await res.json();
      setGeneratedTheme(data.theme ?? DEFAULT_THEME_PREVIEW);
      setThemeSource(data.source ?? "default");
      setThemeWarning(data.warning ?? "");
    } catch {
      setGeneratedTheme(DEFAULT_THEME_PREVIEW);
      setThemeSource("default");
      setThemeWarning("Nao foi possivel gerar via IA. Usando tema padrao.");
    } finally {
      setStep("preview");
    }
  }

  async function handleCreateEvent() {
    if (!name || !date || !ownerName || !ownerEmail) {
      setError("Preencha todos os campos obrigatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date: new Date(date).toISOString(),
          description,
          ownerName,
          ownerEmail,
          themeJson: { ...(generatedTheme ?? DEFAULT_THEME_PREVIEW), sections: { ...(generatedTheme ?? DEFAULT_THEME_PREVIEW).sections, ...(spotifyUrl.trim() ? { spotifyUrl: spotifyUrl.trim() } : {}) } },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data.error));
        return;
      }
      router.push(data.url);
    } catch {
      setError("Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  }

  const theme = generatedTheme ?? DEFAULT_THEME_PREVIEW;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900"> EaaS Platform</h1>
          <p className="text-gray-500 mt-2">Crie o site do seu evento em segundos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {/* Dados do evento */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 text-lg">Dados do Evento</h2>
            <input
              type="text"
              placeholder="Nome do evento *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
            />
            <textarea
              placeholder="Descricao do evento (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
            />
          </div>

          {/* Dados do organizador */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="font-semibold text-gray-700 text-lg">Organizador</h2>
            <input
              type="text"
              placeholder="Seu nome *"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              type="email"
              placeholder="Seu e-mail *"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          {/* Tema via IA */}
          <div className="space-y-3 pt-4 border-t">
            <h2 className="font-semibold text-gray-700 text-lg"> Tema com IA</h2>
            <textarea
              placeholder="Descreva o clima do evento (ex: Festa neon anos 80, Casamento boho chic...)"
              value={themeDescription}
              onChange={(e) => setThemeDescription(e.target.value)}
              rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
            />
            {step === "generating" && (
              <p className="text-sm text-purple-600 animate-pulse">Gerando tema com IA...</p>
            )}
            {step === "preview" && generatedTheme && (
              <div
                className="rounded-xl p-4 text-white text-sm"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <p className="font-semibold">{themeSource === "ai" ? " Tema gerado por IA" : " Tema padrao"}</p>
                <p className="opacity-80 mt-1">{theme.sections.tagline}</p>
                {themeWarning && <p className="text-xs opacity-70 mt-2 bg-white/20 rounded p-2">{themeWarning}</p>}
              </div>
            )}
            <button
              type="button"
              onClick={handleGenerateTheme}
              disabled={step === "generating"}
              className="w-full py-3 rounded-xl font-medium text-sm border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-60"
            >
              {step === "generating" ? "Gerando..." : "Gerar Tema"}
            </button>
          </div>
          {/* Playlist Spotify */}
          <div className="space-y-3 pt-4 border-t">
            <h2 className="font-semibold text-gray-700 text-lg"> Playlist</h2>
            <input
              type="url"
              placeholder="Link da playlist no Spotify (opcional)"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <p className="text-xs text-gray-400">Cole o link de qualquer playlist, álbum ou música do Spotify</p>
          </div>


          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="button"
            onClick={handleCreateEvent}
            disabled={loading}
            className="w-full py-4 rounded-full font-bold text-white disabled:opacity-60 transition-opacity text-lg"
            style={{ backgroundColor: "#7C3AED" }}
          >
            {loading ? "Criando..." : " Criar Meu Evento"}
          </button>
        </div>
      </div>
    </div>
  );
}
