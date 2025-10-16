import MetricCard from "@/app/components/MetricCard";
import { Activity, Target, Zap, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Resumen general del sistema de scouting</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Lanzamientos" value={1247} icon={<Activity size={18} />} />
        <MetricCard title="Efectividad" value="3.45" icon={<Target size={18} />} />
        <MetricCard title="Velocidad Promedio" value="85.3 mph" icon={<Zap size={18} />} />
        <MetricCard title="% Primer Strike" value="67.8%" icon={<TrendingUp size={18} />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h3 className="font-semibold">Distribución por Tipo de Lanzamiento</h3>
          <p className="text-sm text-slate-500">Cantidad de lanzamientos por tipo registrados</p>
          <div className="mt-4 h-64 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-sm">[Gráfico de barras]</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h3 className="font-semibold">Efectividad General</h3>
          <p className="text-sm text-slate-500">Proporción de strikes vs bolas</p>
          <div className="mt-4 h-64 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-sm">[Gráfico circular]</span>
          </div>
        </div>
      </section>
      <div className="h-16 bg-slate-200 rounded-xl grid place-items-center">
  Tailwind OK ✅
</div>

    </div>
  );
}
