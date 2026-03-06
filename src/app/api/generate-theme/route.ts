import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ThemeJsonSchema, DEFAULT_THEME } from "@/lib/theme";
import type { ThemeJson } from "@/types";

const RequestSchema = z.object({
  description: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `Voce e um diretor de arte especializado em eventos sociais.
Dado o clima/descricao de um evento, retorne APENAS um JSON valido com a seguinte estrutura:
{
  "colors": {
    "primary": "#HEXCOR",
    "secondary": "#HEXCOR",
    "background": "#HEXCOR",
    "text": "#HEXCOR",
    "accent": "#HEXCOR"
  },
  "fonts": {
    "heading": "Nome da Google Font para titulos",
    "body": "Nome da Google Font para texto"
  },
  "sections": {
    "headline": "Titulo principal do site do evento (max 80 chars)",
    "cta": "Texto do botao principal (max 40 chars)",
    "tagline": "Subtitulo inspirador (max 150 chars)"
  }
}
Regras: cores em hex 6 digitos, alto contraste entre background e text, fontes disponiveis no Google Fonts.
Retorne SOMENTE o JSON, sem markdown, sem explicacoes.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description } = RequestSchema.parse(body);

    const apiKey = process.env.OPENAI_API_KEY;

    // Sem API key: retorna tema default com aviso (util para dev local)
    if (!apiKey) {
      console.warn("[generate-theme] OPENAI_API_KEY not set, returning default theme");
      return NextResponse.json({
        theme: DEFAULT_THEME,
        source: "default",
        warning: "OPENAI_API_KEY nao configurada. Configure para gerar temas via IA.",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[generate-theme] OpenAI error:", err);
      return NextResponse.json({ theme: DEFAULT_THEME, source: "default", warning: "Falha na API da IA." });
    }

    const data = await response.json();
    const rawContent: string = data.choices?.[0]?.message?.content ?? "{}";

    const parsed = JSON.parse(rawContent);
    const validated = ThemeJsonSchema.safeParse(parsed);

    if (!validated.success) {
      console.warn("[generate-theme] Invalid theme from AI:", validated.error.flatten());
      return NextResponse.json({
        theme: DEFAULT_THEME,
        source: "default",
        warning: "Tema gerado pela IA era invalido, usando fallback.",
      });
    }

    const theme: ThemeJson = validated.data;
    return NextResponse.json({ theme, source: "ai" });
  } catch (err) {
    console.error("[generate-theme] Error:", err);
    return NextResponse.json({ error: "Erro ao gerar tema" }, { status: 500 });
  }
}
