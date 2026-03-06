"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ThemeJson } from "@/types";

const DEFAULT_THEME_PREVIEW: ThemeJson = {
  colors: { primary: "#7C3AED", secondary: "#F59E0B", background: "#FAFAFA", text: "#1F2937", accent: "#EC4899" },
  fonts: { heading: "Playfair Display", body: "Inter" },
  sections: {
    headline: "Celebre este momento especial",
    cta: "Ver presentes",
    tagline: "Um dia único merece uma celebração inesquecível.",
  },
};

const STEPS = [
  { id: 1, label: "Evento", icon: "📅" },
  { id: 2, label: "Organizador", icon: "👤" },
  { id: 3, label: "Tema & Playlist", icon: "🎨" },
];

export default function CriarEventoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [themeStep, setThemeStep] = useState<"idle" | "generating" | "preview">("idle");

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");

  const [generatedTheme, setGeneratedTheme] = useState<ThemeJson | null>(null);
  const [themeSource, setThemeSource] = useState<"ai" | "default">("default");
  const [themeWarning, setThemeWarning] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateTheme() {
    if (!themeDescription.trim()) {
      setGeneratedTheme(DEFAULT_THEME_PREVIEW);
      setThemeSource("default");
      setThemeStep("preview");
      return;
    }
    setThemeStep("generating");
    setError("");
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
      setThemeWarning("Não foi possível gerar via IA. Usando tema padrão.");
    } finally {
      setThemeStep("preview");
    }
  }

  async function handleCreateEvent() {
    if (!name || !date || !ownerName || !ownerEmail) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const theme = generatedTheme ?? DEFAULT_THEME_PREVIEW;
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date: new Date(date).toISOString(),
          description,
          ownerName,
          ownerEmail,
          themeJson: {
            ...theme,
            sections: {
              ...theme.sections,
              ...(spotifyUrl.trim() ? { spotifyUrl: spotifyUrl.trim() } : {}),
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(String(data.error ?? "Erro ao criar evento")); return; }
      router.push(data.url);
    } catch {
      setError("Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  }

  const previewTheme = generatedTheme ?? DEFAULT_THEME_PREVIEW;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-violet-100 px-4">
        <div className="max-w-lg mx-auto h-14 flex items-center justify-between">
          <a href="/" className="font-bold text-violet-700 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            ✨ NOAH
          </a>
          <span className="text-xs text-muted-foreground">
            Passo {step} de {STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-violet-100">
          <div
            className="h-0.5 bg-violet-500 transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </nav>

      <div className="px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Crie seu evento
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Site premium gerado por IA em menos de 2 minutos
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { if (s.id < step) setStep(s.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  step === s.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : step > s.id
                    ? "bg-violet-100 text-violet-700 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-default"
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`h-px w-6 rounded-full ${step > s.id ? "bg-violet-300" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Dados do Evento */}
        {step === 1 && (
          <Card className="shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle>📅 Dados do evento</CardTitle>
              <CardDescription>Informações básicas do seu evento</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="event-name">Nome do evento *</Label>
                <Input
                  id="event-name"
                  placeholder="Ex: Aniversário de 30 anos da Ana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Data e hora *</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-desc">
                  Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="event-desc"
                  placeholder="Uma frase sobre o evento para os convidados"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={!name || !date}
                onClick={() => setStep(2)}
              >
                Próximo →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Organizador */}
        {step === 2 && (
          <Card className="shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle>👤 Organizador</CardTitle>
              <CardDescription>Quem está criando este evento</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="owner-name">Seu nome *</Label>
                <Input
                  id="owner-name"
                  placeholder="Nome completo"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-email">Seu e-mail *</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="voce@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>
                  ← Voltar
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  disabled={!ownerName || !ownerEmail}
                  onClick={() => setStep(3)}
                >
                  Próximo →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Tema & Playlist */}
        {step === 3 && (
          <Card className="shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle>🎨 Tema com IA & Playlist</CardTitle>
              <CardDescription>Personalize a identidade visual do seu evento</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">

              {/* Gerar tema */}
              <div className="space-y-2">
                <Label htmlFor="theme-desc">Descreva o clima do evento</Label>
                <Textarea
                  id="theme-desc"
                  placeholder="Ex: Festa neon anos 80, casamento boho chic, aniversário tropical..."
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-violet-300 text-violet-700 hover:bg-violet-50"
                disabled={themeStep === "generating"}
                onClick={handleGenerateTheme}
              >
                {themeStep === "generating" ? "✨ Gerando tema..." : "✨ Gerar Tema com IA"}
              </Button>

              {/* Preview do tema */}
              {themeStep === "preview" && (
                <div
                  className="rounded-xl p-4 text-white text-sm space-y-1"
                  style={{ backgroundColor: previewTheme.colors.primary }}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-white/20 text-white hover:bg-white/30"
                    >
                      {themeSource === "ai" ? "✨ IA" : "⚙️ Padrão"}
                    </Badge>
                  </div>
                  <p className="font-semibold mt-2" style={{ fontFamily: previewTheme.fonts.heading }}>
                    {previewTheme.sections.tagline}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {["primary", "secondary", "accent", "background"].map((key) => (
                      <div
                        key={key}
                        className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: previewTheme.colors[key as keyof typeof previewTheme.colors] }}
                        title={key}
                      />
                    ))}
                  </div>
                  {themeWarning && (
                    <p className="text-xs bg-white/20 rounded px-2 py-1 mt-2">{themeWarning}</p>
                  )}
                </div>
              )}

              <Separator />

              {/* Playlist */}
              <div className="space-y-2">
                <Label htmlFor="spotify">
                  Playlist Spotify <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="spotify"
                  type="url"
                  placeholder="https://open.spotify.com/playlist/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link de qualquer playlist, álbum ou música do Spotify
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={loading}
                  onClick={() => setStep(2)}
                >
                  ← Voltar
                </Button>
                <Button
                  className="flex-1 rounded-full font-bold shadow-lg shadow-violet-200"
                  disabled={loading}
                  onClick={handleCreateEvent}
                >
                  {loading ? "Criando..." : "🎉 Criar Evento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          ✨ NOAH · Plataforma Event-as-a-Service
        </p>
      </div>
      </div>
    </div>
  );
}
