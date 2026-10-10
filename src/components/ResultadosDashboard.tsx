"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pareja } from "@/lib/types";
import { Trophy, Coffee, BarChart3, Users } from "lucide-react";

interface EvaluacionConPareja {
  id: string;
  token_id: string;
  pareja_id: string;
  evaluador_nombre: string;
  aroma_pts: number;
  balance_pts: number;
  cuerpo_pts: number;
  puntaje_total: number;
  comentarios: string | null;
  creado_en: string;
  parejas: { nombre_pareja: string } | null;
}

interface ParejaStats {
  id: string;
  nombre: string;
  promedioAroma: number;
  promedioBalance: number;
  promedioCuerpo: number;
  promedioTotal: number;
  totalEvaluaciones: number;
}

interface ResultadosDashboardProps {
  evaluacionesIniciales: EvaluacionConPareja[];
  parejasData: Pareja[];
}

export function ResultadosDashboard({ evaluacionesIniciales, parejasData }: ResultadosDashboardProps) {
  const [evaluaciones, setEvaluaciones] = useState(evaluacionesIniciales);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("evaluaciones-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "evaluaciones" },
        async (payload) => {
          // Fetch the full evaluation with pareja name
          const { data } = await supabase
            .from("evaluaciones")
            .select("*, parejas(nombre_pareja)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setEvaluaciones((prev) => [data as EvaluacionConPareja, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate stats per pareja
  const stats: ParejaStats[] = useMemo(() => {
    return parejasData.map((pareja) => {
      const evals = evaluaciones.filter((e) => e.pareja_id === pareja.id);
      const count = evals.length;

      if (count === 0) {
        return {
          id: pareja.id,
          nombre: pareja.nombre_pareja,
          promedioAroma: 0,
          promedioBalance: 0,
          promedioCuerpo: 0,
          promedioTotal: 0,
          totalEvaluaciones: 0,
        };
      }

      const sumAroma = evals.reduce((s, e) => s + e.aroma_pts, 0);
      const sumBalance = evals.reduce((s, e) => s + e.balance_pts, 0);
      const sumCuerpo = evals.reduce((s, e) => s + e.cuerpo_pts, 0);
      const sumTotal = evals.reduce((s, e) => s + e.puntaje_total, 0);

      return {
        id: pareja.id,
        nombre: pareja.nombre_pareja,
        promedioAroma: sumAroma / count,
        promedioBalance: sumBalance / count,
        promedioCuerpo: sumCuerpo / count,
        promedioTotal: sumTotal / count,
        totalEvaluaciones: count,
      };
    })
    .sort((a, b) => b.promedioTotal - a.promedioTotal);
  }, [evaluaciones, parejasData]);

  const ganador = stats.find((s) => s.totalEvaluaciones > 0);
  const totalEvals = evaluaciones.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Coffee className="h-10 w-10 text-amber-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Resultados en Vivo
          </h1>
          <Coffee className="h-10 w-10 text-amber-400" />
        </div>
        <p className="text-gray-400">Competencia de Filtrado V60 — Ficha de Cata Rápida</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">En vivo</span>
          <span className="text-gray-500 text-sm ml-4">
            <Users className="inline h-4 w-4 mr-1" />
            {totalEvals} evaluaciones recibidas
          </span>
        </div>
      </div>

      {/* Winner Card */}
      {ganador && ganador.totalEvaluaciones > 0 && (
        <div className="bg-gradient-to-br from-amber-900/50 to-yellow-900/30 border border-amber-700/50 rounded-2xl p-8 text-center">
          <Trophy className="mx-auto h-16 w-16 text-yellow-400 mb-3" />
          <p className="text-amber-300 text-sm font-semibold uppercase tracking-widest mb-1">Líder Actual</p>
          <h2 className="text-4xl font-bold text-white mb-2">{ganador.nombre}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-yellow-400">
              {ganador.promedioTotal.toFixed(1)}
            </span>
            <span className="text-xl text-gray-400">/ 15 pts</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Promedio de {ganador.totalEvaluaciones} evaluación(es)
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-bold">Tabla de Posiciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-800">
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Pareja</th>
                <th className="px-6 py-3 text-center">Aroma</th>
                <th className="px-6 py-3 text-center">Balance</th>
                <th className="px-6 py-3 text-center">Cuerpo</th>
                <th className="px-6 py-3 text-center font-bold text-amber-400">Total</th>
                <th className="px-6 py-3 text-center">Evals</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-800/50 transition-colors ${
                    i === 0 && s.totalEvaluaciones > 0
                      ? "bg-amber-900/20"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${
                      i === 0 && s.totalEvaluaciones > 0 ? "text-yellow-400" :
                      i === 1 && s.totalEvaluaciones > 0 ? "text-gray-300" :
                      i === 2 && s.totalEvaluaciones > 0 ? "text-amber-600" :
                      "text-gray-500"
                    }`}>
                      {s.totalEvaluaciones > 0 ? i + 1 : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{s.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    {s.totalEvaluaciones > 0 ? s.promedioAroma.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.totalEvaluaciones > 0 ? s.promedioBalance.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.totalEvaluaciones > 0 ? s.promedioCuerpo.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-bold ${
                      s.totalEvaluaciones > 0 ? "text-amber-400" : "text-gray-600"
                    }`}>
                      {s.totalEvaluaciones > 0 ? s.promedioTotal.toFixed(1) : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">
                    {s.totalEvaluaciones}
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay parejas registradas aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Bars */}
      {stats.some((s) => s.totalEvaluaciones > 0) && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            Desglose por Criterio
          </h3>
          <div className="space-y-6">
            {stats
              .filter((s) => s.totalEvaluaciones > 0)
              .map((s) => (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{s.nombre}</span>
                    <span className="text-amber-400 font-bold">
                      {s.promedioTotal.toFixed(1)} / 15
                    </span>
                  </div>
                  {/* Aroma bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">Aroma</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${(s.promedioAroma / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 w-8 text-right">
                      {s.promedioAroma.toFixed(1)}
                    </span>
                  </div>
                  {/* Balance bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">Balance</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-700"
                        style={{ width: `${(s.promedioBalance / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 w-8 text-right">
                      {s.promedioBalance.toFixed(1)}
                    </span>
                  </div>
                  {/* Cuerpo bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">Cuerpo</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                        style={{ width: `${(s.promedioCuerpo / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 w-8 text-right">
                      {s.promedioCuerpo.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
