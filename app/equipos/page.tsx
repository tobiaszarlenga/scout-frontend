'use client';
import { useEquipos } from '@/hooks/useEquipos';

export default function EquiposPage() {
  const { list, remove } = useEquipos();

  if (list.isLoading) return <p>Cargando…</p>;
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const equipos = list.data ?? [];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Equipos</h1>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Ciudad</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((e) => (
            <tr key={e.id}>
              <td className="p-2 border">{e.id}</td>
              <td className="p-2 border">{e.nombre}</td>
              <td className="p-2 border">{e.ciudad ?? '—'}</td>
              <td className="p-2 border">
                {/* Edit lo hacemos en el próximo paso */}
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => remove.mutate(e.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
          {equipos.length === 0 && (
            <tr><td className="p-2 border text-center" colSpan={4}>Sin equipos</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
