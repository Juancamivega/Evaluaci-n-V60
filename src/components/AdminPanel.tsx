"use client";

import { useState } from "react";
import { ParejasManager } from "@/components/ParejasManager";
import { Evaluacion, Pareja, ParejaResumenStats } from "@/lib/types";
import { exportarEvaluacionesAExcel } from "@/lib/exportExcel";
import {
  Settings,
  Coffee,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Loader2,
  Database,
  ExternalLink,
} from "lucide-react";

interface AdminPanelProps {
  parejasIniciales: Pareja[];
  evaluacionesIniciales: Evaluacion[];
}

export function AdminPanel({
  parejasIniciales,
  evaluacionesIniciales,
}: AdminPanelProps) {
  const [parejas, setParejas] = useState<Pareja[]>(parejasIniciales);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(evaluacionesIniciales);
  const [confirmacionTexto, setConfirmacionTexto] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [mensajeReset, setMensajeReset] = useState("");

  // Handler para exportar
  function handleExportarExcel() {
    // Generar stats básicas
    const stats: ParejaResumenStats[] = parejas.map((p) => {
      const evals = evaluaciones.filter(
        (e) => e.pareja_nombre.trim().toLowerCase() === p.nombre_pareja.trim().toLowerCase()
      );
      const count = evals.length;
      if (count === 0) {
        return {
          nombre: p.nombre_pareja,
          totalEvaluaciones: 0,
          promedioPresentacion: 0,
          promedioTecnicos: 0,
          promedioSensorial: 0,
          promedioTotalPonderado: 0,
          promedioTotalSimple: 0,
          metodosUtilizados: [],
          evaluadores: [],
        };
      }
      return {
        nombre: p.nombre_pareja,
        totalEvaluaciones: count,
        promedioPresentacion:
          evals.reduce((a, b) => a + Number(b.promedio_presentacion), 0) / count,
        promedioTecnicos:
          evals.reduce((a, b) => a + Number(b.promedio_tecnicos), 0) / count,
        promedioSensorial:
          evals.reduce((a, b) => a + Number(b.promedio_sensorial), 0) / count,
        promedioTotalPonderado:
          evals.reduce((a, b) => a + Number(b.total_ponderado), 0) / count,
        promedioTotalSimple:
          evals.reduce((a, b) => a + Number(b.total_simple || 0), 0) / count,
        metodosUtilizados: Array.from(new Set(evals.map((e) => e.metodo))),
        evaluadores: Array.from(new Set(evals.map((e) => e.evaluador))),
      };
    });

    exportarEvaluacionesAExcel(evaluaciones, stats);
  }

  // Handler para reiniciar evaluaciones
  async function handleResetEvaluaciones(e: React.FormEvent) {
    e.preventDefault();
    if (confirmacionTexto.trim() !== "REINICIAR") return;

    setLoadingReset(true);
    setMensajeReset("");

    try {
      const res = await fetch("/api/admin/limpiar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacion: "REINICIAR" }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvaluaciones([]);
        setConfirmacionTexto("");
        setMensajeReset("Se han borrado todas las evaluaciones correctamente.");
      } else {
        setMensajeReset(`Error: ${data.error || "No se pudo reiniciar"}`);
      }
    } catch {
      setMensajeReset("Error de red al intentar reiniciar.");
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-800/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 uppercase mb-2">
            <Settings className="h-3.5 w-3.5" /> Administración del Sistema
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Gestión y Trazabilidad de Evaluaciones
          </h1>
          <p className="text-amber-200 text-sm max-w-xl mt-1">
            Administra las parejas participantes, descarga los registros completos para trazabilidad y gestiona el flujo de la competencia.
          </p>
        </div>

        {/* Botón Excel */}
        <button
          onClick={handleExportarExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer text-sm"
        >
          <Download className="h-5 w-5" />
          <span>Exportar a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500">
              Parejas Registradas
            </p>
            <p className="text-3xl font-black text-amber-950 mt-1">
              {parejas.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800">
            <Coffee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500">
              Evaluaciones Almacenadas
            </p>
            <p className="text-3xl font-black text-amber-950 mt-1">
              {evaluaciones.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Gestor de Parejas */}
      <ParejasManager parejas={parejas} setParejas={setParejas} />

      {/* Guía de Trazabilidad en Supabase */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-base">
            ¿Cómo exportar también directamente desde Supabase?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Para trazabilidad o auditoría interna, los datos quedan almacenados permanentemente en la nube de Supabase. Puedes exportarlos de dos formas:
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-gray-700 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <li>
            <strong>Desde esta aplicación:</strong> Haz clic en el botón verde{" "}
            <span className="font-semibold text-emerald-700">Exportar a Excel (.xlsx)</span>{" "}
            arriba y obtendrás el archivo oficial formateado al instante.
          </li>
          <li>
            <strong>Desde la consola de Supabase:</strong> Entra a tu proyecto en{" "}
            <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">
              supabase.com
            </span>{" "}
            &gt; <strong>Table Editor</strong> &gt; selecciona la tabla{" "}
            <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">
              evaluaciones
            </span>{" "}
            &gt; haz clic en el botón superior derecho <strong>&ldquo;Export to CSV&rdquo;</strong>.
          </li>
        </ol>
      </div>

      {/* Zona de Peligro: Reinicio de Evaluaciones */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-bold text-base">Zona de Mantenimiento / Reiniciar Competencia</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Si vas a iniciar una nueva ronda o deseas borrar las evaluaciones de prueba registradas, puedes reiniciar la tabla de evaluaciones.
          (Las parejas registradas no se eliminarán).
        </p>

        {mensajeReset && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {mensajeReset}
          </div>
        )}

        <form onSubmit={handleResetEvaluaciones} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={confirmacionTexto}
            onChange={(e) => setConfirmacionTexto(e.target.value)}
            placeholder="Escribe REINICIAR para confirmar"
            className="rounded-xl border-2 border-rose-200 px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-rose-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loadingReset || confirmacionTexto.trim() !== "REINICIAR"}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            {loadingReset ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Borrar Todas las Evaluaciones</span>
          </button>
        </form>
      </div>
    </div>
  );
}
