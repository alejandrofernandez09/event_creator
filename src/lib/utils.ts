/**
 * Formata centavos para Real brasileiro.
 * ex: 20000 -> "R$ 200,00"
 */
export function formatBRL(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

/**
 * Calcula a comissao de 10% sobre o total transacionado.
 */
export function calcComissao(totalCentavos: number): number {
  return Math.round(totalCentavos * 0.1);
}

/**
 * Gera um slug URL-safe a partir de um texto.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Trata erros de API de forma uniforme.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erro desconhecido";
}
