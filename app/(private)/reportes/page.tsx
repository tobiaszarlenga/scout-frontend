export default function ReportesPage() {
  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-8">
          <h1
            className="text-4xl font-bold text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            Reportes
          </h1>
        </header>

        <div className="rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-sm">
          <p className="text-gray-700">Vista de reportes en construcción.</p>
        </div>
      </div>
    </main>
  );
}
