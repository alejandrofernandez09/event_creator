import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata centavos para moeda BRL. Ex: 15000 -> "R$\u00a0150,00" */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

/** Calcula comissao de 10% sobre valor em centavos. */
export function calcComissao(totalCents: number): number {
  return Math.round(totalCents * 0.1);
}

/** Converte uma string para slug URL-friendly. Ex: "Aniversário da Ana!" -> "aniversario-da-ana" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")      // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-")              // spaces to hyphens
    .replace(/-+/g, "-")               // collapse multiple hyphens
    .substring(0, 80);
}
