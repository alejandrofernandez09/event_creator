import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EaaS Platform",
  description: "Event-as-a-Service: site premium + presentes via Pix",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
