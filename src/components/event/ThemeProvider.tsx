"use client";

import { useEffect } from "react";
import type { ThemeJson } from "@/types";
import { buildGoogleFontsUrl, themeToCssVars } from "@/lib/theme";

interface ThemeProviderProps {
  theme: ThemeJson;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const vars = themeToCssVars(theme);
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <>
      {/* Carrega fontes do Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={buildGoogleFontsUrl(theme)} rel="stylesheet" />
      {children}
    </>
  );
}
