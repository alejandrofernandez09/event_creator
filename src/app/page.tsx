import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: "",
    title: "Site temático por IA",
    desc: "Descreva o clima do evento e a IA gera paleta de cores, fontes e copywriting em segundos.",
  },
  {
    icon: "",
    title: "Lista de presentes via Pix",
    desc: "Convidados presenteiam direto pelo celular. Você recebe na hora na sua conta.",
  },
  {
    icon: "",
    title: "RSVP nativo",
    desc: "Gestão de confirmações integrada ao site do evento. QR Code único por convidado.",
  },
];

const STEPS = [
  { n: "01", title: "Descreva seu evento", desc: "Nome, data e o clima que você quer transmitir." },
  { n: "02", title: "IA gera o tema", desc: "Paleta de cores, fontes e textos gerados automaticamente." },
  { n: "03", title: "Compartilhe o link", desc: "Convidados acessam, confirmam presença e presenteiam via Pix." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50">

      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-violet-100 px-4">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
          <span className="font-bold text-lg text-violet-700 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
             NOAH
          </span>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs bg-violet-100 text-violet-700">
              POC
            </Badge>
            <Button asChild size="sm" className="rounded-full shadow-sm">
              <Link href="/criar">Criar evento</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-200/20 blur-2xl" />
          <div className="absolute top-10 left-1/4 w-[200px] h-[200px] rounded-full bg-amber-200/20 blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-6 text-violet-700 border-violet-300 bg-violet-50/80">
            Event-as-a-Service
          </Badge>
          <h1
            className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 bg-gradient-to-br from-violet-700 via-violet-500 to-pink-500 bg-clip-text text-transparent"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Seu evento,<br />do jeito certo.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Site temático por IA · Lista de presentes via Pix · RSVP nativo.
            <br className="hidden sm:block" /> Tudo pronto em menos de 2 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8 rounded-full shadow-lg shadow-violet-200">
              <Link href="/criar"> Criar meu evento</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 rounded-full border-violet-300 text-violet-700 hover:bg-violet-50">
              <Link href="/demo-evento-123">Ver demo ao vivo </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-violet-100 bg-white/60 backdrop-blur-sm py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <span> Site em segundos</span>
          <span className="hidden sm:block text-violet-200">|</span>
          <span> Pix direto na sua conta</span>
          <span className="hidden sm:block text-violet-200">|</span>
          <span> Sem taxas antecipadas</span>
          <span className="hidden sm:block text-violet-200">|</span>
          <span> Mobile first</span>
        </div>
      </div>

      {/* Features */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-violet-500 mb-3">Tudo que você precisa</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Uma plataforma, três superpoderes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-violet-100 hover:shadow-lg hover:shadow-violet-100/60 hover:-translate-y-1 transition-all duration-200">
              <CardContent className="pt-7 pb-7">
                <div className="text-4xl mb-5 w-14 h-14 flex items-center justify-center rounded-2xl bg-violet-50">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 bg-gradient-to-br from-violet-600 to-violet-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-violet-300 mb-3">Simples assim</p>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: '"Playfair Display", serif' }}>
              Como funciona
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%_-_1rem)] w-1/2 h-px bg-white/20" />
                )}
                <div className="flex flex-col gap-3">
                  <span className="text-4xl font-black text-white/20 leading-none">{s.n}</span>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  <p className="text-sm text-violet-200 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-white text-violet-700 hover:bg-violet-50 rounded-full px-8 font-bold">
              <Link href="/criar">Começar agora </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-violet-700" style={{ fontFamily: '"Playfair Display", serif' }}>
             NOAH
          </span>
          <p>Plataforma em fase POC · {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <Link href="/criar" className="hover:text-violet-600 transition-colors">Criar evento</Link>
            <Link href="/demo-evento-123" className="hover:text-violet-600 transition-colors">Demo</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}