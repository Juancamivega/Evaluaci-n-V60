"use client";

import { useState } from "react";
import { Pareja } from "@/lib/types";
import { PuntuacionControl } from "@/components/PuntuacionControl";
import { CheckCircle2, Coffee, Send, Loader2 } from "lucide-react";

interface EvaluacionFormProps {
  token: string;
  parejas: Pareja[];
  evaluadorNombre: string;
}

export function EvaluacionForm({ token, parejas, evaluadorNombre }: EvaluacionFormProps) {
  const [parejaId, setParejaId] = useState("");
  const [nombre, setNombre] = useState(evaluadorNombre);
  const [aroma, setAroma] = useState(0);
  const [balance, setBalance] = useState(0);
  const [cuerpo, setCuerpo] = useState(0);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const puntajeTotal = aroma + balance + cuerpo;
  const isValid = parejaId && nombre.trim() && aroma > 0 && balance > 0 && cuerpo > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          pareja_id: parejaId,
          evaluador_nombre: nombre.trim(),
          aroma_pts: aroma,
          balance_pts: balance,
          cuerpo_pts: cuerpo,
          comentarios: comentarios.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar la evaluación");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Evaluación Enviada!</h2>
        <p className="text-gray-600 mb-4">
          Tu evaluación ha sido registrada exitosamente.
        </p>
        <div className="bg-green-50 rounded-xl p-4 inline-block">
          <p className="text-green-800 font-semibold text-lg">
            Puntaje Final: {puntajeTotal} / 15 pts
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-amber-900 text-white rounded-2xl p-6 text-center shadow-lg">
        <Coffee className="mx-auto h-10 w-10 mb-2" />
        <h1 className="text-2xl font-bold">Ficha de Cata Rápida</h1>
        <p className="text-amber-200 text-sm mt-1">Competencia de Filtrado V60</p>
      </div>

      {/* Pareja & Evaluador */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pareja Evaluada
          </label>
          <select
            value={parejaId}
            onChange={(e) => setParejaId(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 p-3 text-gray-900 focus:border-amber-500 focus:ring-amber-500 focus:outline-none transition-colors bg-white"
            required
          >
            <option value="">Selecciona una pareja...</option>
            {parejas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_pareja}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Evaluador(a)
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full rounded-xl border-2 border-gray-200 p-3 text-gray-900 focus:border-amber-500 focus:ring-amber-500 focus:outline-none transition-colors"
            required
          />
        </div>
      </div>

      {/* Aroma */}
      <PuntuacionControl
        titulo="1. AROMA"
        subtitulo="Máximo 5 puntos"
        valor={aroma}
        onChange={setAroma}
        descriptorBajo="Apagado / Poco intenso"
        descriptorAlto="Intenso, fresco y agradable"
        colorAccent="amber"
      />

      {/* Balance de Sabor */}
      <PuntuacionControl
        titulo="2. BALANCE DE SABOR"
        subtitulo="Máximo 5 puntos"
        valor={balance}
        onChange={setBalance}
        descriptorBajo="Agrio/Ácido (Subextraído) · Amargo/Seco (Sobreextraído)"
        descriptorAlto="Dulce, limpio y balanceado (Extracción Ideal)"
        colorAccent="orange"
      />

      {/* Cuerpo y Textura */}
      <PuntuacionControl
        titulo="3. CUERPO Y TEXTURA"
        subtitulo="Máximo 5 puntos"
        valor={cuerpo}
        onChange={setCuerpo}
        descriptorBajo="Aguado / Inconsistente / Sin cuerpo"
        descriptorAlto="Sedoso / Redondo / Agradable en boca"
        colorAccent="yellow"
      />

      {/* Puntaje Total */}
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Puntaje Final de Cata</p>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-5xl font-bold ${
            puntajeTotal === 0 ? "text-gray-300" :
            puntajeTotal <= 6 ? "text-red-500" :
            puntajeTotal <= 10 ? "text-amber-500" :
            "text-green-600"
          }`}>
            {puntajeTotal}
          </span>
          <span className="text-2xl text-gray-400 font-light">/ 15 pts</span>
        </div>
      </div>

      {/* Comentarios */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Comentarios (opcional)
        </label>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Notas adicionales sobre la taza..."
          rows={3}
          className="w-full rounded-xl border-2 border-gray-200 p-3 text-gray-900 focus:border-amber-500 focus:ring-amber-500 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-amber-900 hover:bg-amber-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="h-5 w-5" /> Enviar Evaluación</>
        )}
      </button>
    </form>
  );
}
