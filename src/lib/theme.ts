import { z } from "zod";
import type { ThemeJson } from "@/types";

//  Schema de validacao Zod 

export const ThemeColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser hex de 6 digitos"),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const ThemeFontsSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

export const ThemeSectionsSchema = z.object({
  headline: z.string().min(1).max(120),
  cta: z.string().min(1).max(60),
  tagline: z.string().min(1).max(200),
  aboutTitle: z.string().max(80).optional(),
  spotifyUrl: z.string().url().optional(),
});

export const ThemeJsonSchema = z.object({
  colors: ThemeColorsSchema,
  fonts: ThemeFontsSchema,
  sections: ThemeSectionsSchema,
});

//  Tema padrao (fallback) 

export const DEFAULT_THEME: ThemeJson = {
  colors: {
    primary: "#7C3AED",
    secondary: "#F59E0B",
    background: "#FAFAFA",
    text: "#1F2937",
    accent: "#EC4899",
  },
  fonts: {
    heading: "Playfair Display",
    body: "Inter",
  },
  sections: {
    headline: "Celebre este momento especial",
    cta: "Ver lista de presentes",
    tagline: "Um dia unico merece uma celebracao inesquecivel.",
  },
};

//  Helpers 

/**
 * Parse e valida theme_json. Retorna o tema default em caso de falha.
 */
export function parseThemeJson(raw: string | undefined | null): ThemeJson {
  if (!raw) return DEFAULT_THEME;
  try {
    const parsed = JSON.parse(raw);
    const result = ThemeJsonSchema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn("[theme] Invalid theme_json, using default:", result.error.flatten());
    return DEFAULT_THEME;
  } catch {
    console.warn("[theme] Failed to parse theme_json, using default");
    return DEFAULT_THEME;
  }
}

/**
 * Converte ThemeJson em CSS custom properties inline.
 */
export function themeToCssVars(theme: ThemeJson): Record<string, string> {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-background": theme.colors.background,
    "--color-text": theme.colors.text,
    "--color-accent": theme.colors.accent ?? theme.colors.primary,
    "--font-heading": `"${theme.fonts.heading}", serif`,
    "--font-body": `"${theme.fonts.body}", sans-serif`,
  };
}

/**
 * Gera o link de importacao do Google Fonts para o tema.
 */
export function buildGoogleFontsUrl(theme: ThemeJson): string {
  const fonts = [theme.fonts.heading, theme.fonts.body]
    .map((f) => encodeURIComponent(f))
    .join("&family=");
  return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
}
