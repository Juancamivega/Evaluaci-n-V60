"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pareja } from "@/lib/types";
import { Trophy, Coffee, BarChart3, Users, LockKeyhole } from "lucide-react";

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
  mostrarResultadosInicial: boolean;
}

export function ResultadosDashboard({ 
  evaluacionesIniciales, 
  parejasData, 
  mostrarResultadosInicial 
}: ResultadosDashboardProps) {
  const [evaluaciones, setEvaluaciones] = useState(evaluacionesIniciales);
  const [mostrarResultados, setMostrarResultados] = useState(mostrarResultadosInicial);

  // Subscribe to realtime changes for both evaluations and config
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel("public-realtime")
      // Listen to new evaluations
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "evaluaciones" },
        async (payload) => {
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
      // Listen to config changes (lock/unlock results)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracion" },
        (payload) => {
          if (payload.new.id === 1) {
            setMostrarResultados(payload.new.mostrar_resultados);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  if (!mostrarResultados) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <LockKeyhole className="h-24 w-24 text-amber-500/50 animate-pulse mb-4" />
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
          Resultados Ocultos
        </h1>
        <p className="text-gray-400 text-lg max-w-lg">
          La competencia está en curso. Los resultados se revelarán aquí mismo cuando el organizador los desbloquee.
        </p>
        <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-full px-6 py-3 mt-8">
          <span className="inline-flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
          <span className="text-gray-300 font-medium">Recibiendo evaluaciones en vivo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Header */}
      <div className="text-center py-4 sm:py-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Resultados Finales
          </h1>
          <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
        </div>
        <p className="text-gray-400 text-sm sm:text-base">Competencia de Filtrado V60</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-gray-500 text-xs sm:text-sm bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            <Users className="inline h-4 w-4 mr-1" />
            {totalEvals} evaluaciones totales
          </span>
        </div>
      </div>

      {/* Winner Card */}
      {ganador && ganador.totalEvaluaciones > 0 && (
        <div className="bg-gradient-to-br from-amber-900/50 to-yellow-900/30 border border-amber-700/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <Trophy className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mb-3" />
          <p className="text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1">Ganador(es)</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{ganador.nombre}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-yellow-400">
              {ganador.promedioTotal.toFixed(1)}
            </span>
            <span className="text-lg sm:text-xl text-gray-400">/ 15 pts</span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          <h3 className="text-base sm:text-lg font-bold">Tabla de Posiciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Pareja</th>
                <th className="px-3 sm:px-6 py-3 text-center">Aroma</th>
                <th className="px-3 sm:px-6 py-3 text-center">Balance</th>
                <th className="px-3 sm:px-6 py-3 text-center">Cuerpo</th>
                <th className="px-4 sm:px-6 py-3 text-center font-bold text-amber-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-800/50 transition-colors ${
                    i === 0 && s.totalEvaluaciones > 0
                      ? "bg-amber-900/10"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`text-base sm:text-lg font-bold ${
                      i === 0 && s.totalEvaluaciones > 0 ? "text-yellow-400" :
                      i === 1 && s.totalEvaluaciones > 0 ? "text-gray-300" :
                      i === 2 && s.totalEvaluaciones > 0 ? "text-amber-600" :
                      "text-gray-500"
                    }`}>
                      {s.totalEvaluaciones > 0 ? i + 1 : "—"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">{s.nombre}</td>
                  <td className="px-3 sm:px-6 py-4 text-center text-gray-300">
                    {s.totalEvaluaciones > 0 ? s.promedioAroma.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-center text-gray-300">
                    {s.totalEvaluaciones > 0 ? s.promedioBalance.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-center text-gray-300">
                    {s.totalEvaluaciones > 0 ? s.promedioCuerpo.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center bg-gray-900/30">
                    <span className={`text-base sm:text-lg font-bold ${
                      s.totalEvaluaciones > 0 ? "text-amber-400" : "text-gray-600"
                    }`}>
                      {s.totalEvaluaciones > 0 ? s.promedioTotal.toFixed(1) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
