//  Theme JSON 

export interface ThemeColors {
  primary: string;     // hex, ex: "#FF6B35"
  secondary: string;
  background: string;
  text: string;
  accent?: string;
}

export interface ThemeFonts {
  heading: string;    // nome da Google Font, ex: "Playfair Display"
  body: string;
}

export interface ThemeSections {
  headline: string;     // titulo principal do hero
  cta: string;          // texto do botao principal
  tagline: string;      // subtitulo/tagline
  aboutTitle?: string;
  spotifyUrl?: string;
}

export interface ThemeJson {
  colors: ThemeColors;
  fonts: ThemeFonts;
  sections: ThemeSections;
}

//  Domain 

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELED" | "EXPIRED";
export type RsvpStatus = "confirmed" | "declined" | "pending";

export interface EventWithProducts {
  id: string;
  slug: string;
  name: string;
  date: Date;
  themeJson: ThemeJson;
  description: string | null;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;   // centavos
  imgUrl: string | null;
  available: number;
}

export interface DashboardMetrics {
  totalArrecadado: number;  // centavos
  comissaoDevida: number;   // 10% do total
  totalOrders: number;
  confirmedOrders: number;
  totalRsvps: number;
}
