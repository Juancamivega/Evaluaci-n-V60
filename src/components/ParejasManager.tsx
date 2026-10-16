"use client";

import { useState } from "react";
import { Pareja } from "@/lib/types";
import { Plus, Trash2, Users, Loader2, Sparkles } from "lucide-react";

interface ParejasManagerProps {
  parejas: Pareja[];
  setParejas: React.Dispatch<React.SetStateAction<Pareja[]>>;
}

export function ParejasManager({ parejas, setParejas }: ParejasManagerProps) {
  const [nombre, setNombre] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoadingAdd(true);
    setMensaje("");
    try {
      const res = await fetch("/api/parejas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_pareja: nombre.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setParejas((prev) => [...prev, data]);
        setNombre("");
        setMensaje("Pareja agregada correctamente.");
      } else {
        setMensaje(`Error: ${data.error || "No se pudo agregar"}`);
      }
    } catch {
      setMensaje("Error de red al agregar.");
    } finally {
      setLoadingAdd(false);
    }
  }

  async function handleSeedOficiales() {
    setLoadingSeed(true);
    setMensaje("");
    try {
      const res = await fetch("/api/parejas/seed", { method: "POST" });
      if (res.ok) {
        // Refetch parejas
        const listRes = await fetch("/api/parejas");
        if (listRes.ok) {
          const listData = await listRes.json();
          setParejas(listData);
          setMensaje("¡Las 13 parejas oficiales han sido cargadas exitosamente!");
        }
      }
    } catch {
      setMensaje("Error al cargar las parejas oficiales.");
    } finally {
      setLoadingSeed(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar esta pareja?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/parejas?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setParejas((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // Error silencioso
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-700" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Parejas Participantes ({parejas.length})
          </h2>
        </div>

        <button
          onClick={handleSeedOficiales}
          disabled={loadingSeed}
          className="flex items-center justify-center gap-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
          title="Inserta las 13 parejas oficiales del SENA"
        >
          {loadingSeed ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          )}
          <span>Cargar las 13 Parejas Oficiales</span>
        </button>
      </div>

      {mensaje && (
        <div className="px-6 py-2 bg-amber-50 text-amber-900 text-xs font-semibold border-b border-amber-100">
          {mensaje}
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleAdd} className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la nueva pareja (ej: NOMBRE Y NOMBRE)"
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-amber-600 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loadingAdd || !nombre.trim()}
          className="bg-amber-900 hover:bg-amber-800 disabled:bg-gray-300 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs sm:text-sm"
        >
          {loadingAdd ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>Agregar</span>
        </button>
      </form>

      {/* Parejas List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {parejas.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-xs sm:text-sm">
            No hay parejas registradas en la base de datos. Haz clic en &ldquo;Cargar las 13 Parejas Oficiales&rdquo;.
          </div>
        ) : (
          parejas.map((p, idx) => (
            <div
              key={p.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono w-5">
                  {idx + 1}.
                </span>
                <span className="font-bold text-gray-800 text-xs sm:text-sm">
                  {p.nombre_pareja}
                </span>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Eliminar pareja"
              >
                {deletingId === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
