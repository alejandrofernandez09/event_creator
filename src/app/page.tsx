import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6"></div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">EaaS Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Transforme seu evento em um hub digital premium.<br />
          Site tematico + Lista de presentes via Pix + RSVP nativo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/criar"
            className="px-8 py-4 rounded-full font-bold text-white text-lg bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg"
          >
            Criar meu evento
          </Link>
          <Link
            href="/demo-evento-123"
            className="px-8 py-4 rounded-full font-bold text-purple-600 text-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
          >
            Ver demo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-12">Plataforma em fase POC · {new Date().getFullYear()}</p>
      </div>
    </main>
  );
}
