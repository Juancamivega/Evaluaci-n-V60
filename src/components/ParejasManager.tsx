"use client";

import { useState } from "react";
import { Pareja } from "@/lib/types";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";

interface ParejasManagerProps {
  parejas: Pareja[];
  setParejas: React.Dispatch<React.SetStateAction<Pareja[]>>;
}

export function ParejasManager({ parejas, setParejas }: ParejasManagerProps) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/parejas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_pareja: nombre.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setParejas((prev) => [...prev, data]);
        setNombre("");
      }
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <Users className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-bold text-gray-900">Parejas Participantes</h2>
        <span className="ml-auto text-sm text-gray-500">{parejas.length} registradas</span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la pareja (ej: Pareja 1)"
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
          required
        />
        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Agregar
        </button>
      </form>

      {/* Parejas list */}
      <div className="divide-y divide-gray-100">
        {parejas.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            No hay parejas registradas. Agrega la primera.
          </div>
        ) : (
          parejas.map((p) => (
            <div
              key={p.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800">{p.nombre_pareja}</span>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
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
