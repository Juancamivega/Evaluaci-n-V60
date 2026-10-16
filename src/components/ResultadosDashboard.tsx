"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Evaluacion, Pareja, ParejaResumenStats } from "@/lib/types";
import { PAREJAS_PREDETERMINADAS } from "@/lib/constants";
import { exportarEvaluacionesAExcel } from "@/lib/exportExcel";
import { ExcelExportModal } from "@/components/ExcelExportModal";
import {
  Trophy,
  Coffee,
  BarChart3,
  Users,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResultadosDashboardProps {
  evaluacionesIniciales: Evaluacion[];
  parejasDb: Pareja[];
  mostrarResultadosInicial?: boolean;
}

export function ResultadosDashboard({
  evaluacionesIniciales,
  parejasDb,
}: ResultadosDashboardProps) {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>(evaluacionesIniciales);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"acumulado" | "individuales">("acumulado");
  const [evaluacionExpandida, setEvaluacionExpandida] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Lista de parejas
  const parejasNombres = useMemo(() => {
    if (parejasDb && parejasDb.length > 0) {
      return parejasDb.map((p) => p.nombre_pareja);
    }
    return PAREJAS_PREDETERMINADAS;
  }, [parejasDb]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("evaluaciones-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "evaluaciones" },
        (payload) => {
          setEvaluaciones((prev) => [payload.new as Evaluacion, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "evaluaciones" },
        (payload) => {
          setEvaluaciones((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Estadísticas acumuladas por pareja
  const statsPorPareja: ParejaResumenStats[] = useMemo(() => {
    return parejasNombres
      .map((nombre) => {
        const evals = evaluaciones.filter(
          (e) => e.pareja_nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        );
        const count = evals.length;

        if (count === 0) {
          return {
            nombre,
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

        const sumPres = evals.reduce((acc, e) => acc + Number(e.promedio_presentacion), 0);
        const sumTec = evals.reduce((acc, e) => acc + Number(e.promedio_tecnicos), 0);
        const sumSens = evals.reduce((acc, e) => acc + Number(e.promedio_sensorial), 0);
        const sumTotalPond = evals.reduce((acc, e) => acc + Number(e.total_ponderado), 0);
        const sumTotalSimp = evals.reduce((acc, e) => acc + Number(e.total_simple || 0), 0);

        const metodos = Array.from(new Set(evals.map((e) => e.metodo)));
        const evaluadores = Array.from(new Set(evals.map((e) => e.evaluador)));

        return {
          nombre,
          totalEvaluaciones: count,
          promedioPresentacion: sumPres / count,
          promedioTecnicos: sumTec / count,
          promedioSensorial: sumSens / count,
          promedioTotalPonderado: sumTotalPond / count,
          promedioTotalSimple: sumTotalSimp / count,
          metodosUtilizados: metodos,
          evaluadores,
        };
      })
      .sort((a, b) => {
        // Ordenar por promedio ponderado descendente, luego por total de evaluaciones
        if (b.promedioTotalPonderado !== a.promedioTotalPonderado) {
          return b.promedioTotalPonderado - a.promedioTotalPonderado;
        }
        return b.totalEvaluaciones - a.totalEvaluaciones;
      });
  }, [evaluaciones, parejasNombres]);

  // Filtrado
  const statsFiltradas = useMemo(() => {
    if (!filtroTexto.trim()) return statsPorPareja;
    const term = filtroTexto.toLowerCase();
    return statsPorPareja.filter((s) => s.nombre.toLowerCase().includes(term));
  }, [statsPorPareja, filtroTexto]);

  const evaluacionesFiltradas = useMemo(() => {
    if (!filtroTexto.trim()) return evaluaciones;
    const term = filtroTexto.toLowerCase();
    return evaluaciones.filter(
      (e) =>
        e.pareja_nombre.toLowerCase().includes(term) ||
        e.metodo.toLowerCase().includes(term)
    );
  }, [evaluaciones, filtroTexto]);

  const ganador = statsPorPareja.find((s) => s.totalEvaluaciones > 0);
  const totalEvaluaciones = evaluaciones.length;

  function handleDescargarExcel() {
    setIsExportModalOpen(true);
  }

  function handleConfirmDownload() {
    exportarEvaluacionesAExcel(evaluaciones, statsPorPareja);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-amber-800/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 uppercase">
            <Coffee className="h-3.5 w-3.5" /> SENA Barismo · Resultados Oficiales
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Tabla de Posiciones y Promedios
          </h1>
          <p className="text-amber-200 text-sm max-w-xl">
            Promedios ponderados acumulados: Presentación (30%), Aspectos Técnicos (30%) y Preparación/Sensorial (40%).
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs text-amber-300">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {parejasNombres.length} Parejas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {totalEvaluaciones} Evaluaciones Registradas
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              En vivo
            </span>
          </div>
        </div>

        {/* Botón Exportar a Excel */}
        <button
          onClick={handleDescargarExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer text-sm"
          title="Descarga el archivo Excel con el resumen acumulado y todas las evaluaciones detalladas"
        >
          <Download className="h-5 w-5" />
          <span>Exportar a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Podio / Tarjeta de Ganador Actual */}
      {ganador && (
        <div className="bg-gradient-to-br from-amber-900/40 via-amber-800/20 to-stone-900 border border-amber-600/40 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-400 border border-amber-400/40">
            <Trophy className="h-8 w-8" />
          </div>
          <p className="text-amber-300 text-xs font-bold uppercase tracking-widest">
            Primer Lugar Actual
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {ganador.nombre}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-400">
              {ganador.promedioTotalPonderado.toFixed(3)}
            </span>
            <span className="text-stone-400 text-sm">/ 5.000 pts</span>
          </div>
          <p className="text-xs text-stone-300 mt-2">
            Basado en {ganador.totalEvaluaciones} evaluación(es) · Métodos:{" "}
            {ganador.metodosUtilizados.join(", ") || "—"}
          </p>
        </div>
      )}

      {/* Barra de Control: Pestañas + Buscador */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle de Vistas */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setVistaActiva("acumulado")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              vistaActiva === "acumulado"
                ? "bg-white text-amber-950 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Ranking Acumulado</span>
          </button>
          <button
            onClick={() => setVistaActiva("individuales")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              vistaActiva === "individuales"
                ? "bg-white text-amber-950 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Detalle Individual ({evaluaciones.length})</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por pareja o juez..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-amber-600 focus:outline-none"
          />
        </div>
      </div>

      {/* VISTA 1: TABLA ACUMULADA POR PAREJA */}
      {vistaActiva === "acumulado" && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-stone-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-700" />
              Posiciones Generales (Ponderado 30% / 30% / 40%)
            </h3>
            <span className="text-xs text-gray-500">
              Escala oficial de 1.000 a 5.000
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center font-bold">#</th>
                  <th className="px-4 py-3 font-bold">Pareja Participante</th>
                  <th className="px-3 py-3 text-center font-bold">Evals.</th>
                  <th className="px-3 py-3 text-center font-bold text-amber-900">
                    Presentación (30%)
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-amber-900">
                    Técnicos (30%)
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-amber-900">
                    Sensorial (40%)
                  </th>
                  <th className="px-4 py-3 text-center font-black text-amber-950 bg-amber-50">
                    TOTAL PONDERADO
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsFiltradas.map((item, index) => {
                  const tieneEvals = item.totalEvaluaciones > 0;
                  const esPodio = index < 3 && tieneEvals;

                  return (
                    <tr
                      key={item.nombre}
                      className={`hover:bg-amber-50/40 transition-colors ${
                        index === 0 && tieneEvals ? "bg-amber-50/60 font-semibold" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        {tieneEvals ? (
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              index === 0
                                ? "bg-amber-400 text-amber-950 shadow"
                                : index === 1
                                ? "bg-gray-300 text-gray-900 shadow"
                                : index === 2
                                ? "bg-amber-700 text-amber-100 shadow"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        {item.nombre}
                        {item.metodosUtilizados.length > 0 && (
                          <div className="text-[11px] font-normal text-gray-500 mt-0.5">
                            {item.metodosUtilizados.join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-medium">
                        {item.totalEvaluaciones > 0 ? (
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold text-gray-800">
                            {item.totalEvaluaciones}
                          </span>
                        ) : (
                          <span className="text-gray-300">0</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center text-gray-700">
                        {tieneEvals ? item.promedioPresentacion.toFixed(2) : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-center text-gray-700">
                        {tieneEvals ? item.promedioTecnicos.toFixed(2) : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-center text-gray-700">
                        {tieneEvals ? item.promedioSensorial.toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center bg-amber-50/50">
                        {tieneEvals ? (
                          <span className="text-base font-extrabold text-amber-900">
                            {item.promedioTotalPonderado.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: LISTA DE EVALUACIONES INDIVIDUALES */}
      {vistaActiva === "individuales" && (
        <div className="space-y-4">
          {evaluacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-200">
              No hay evaluaciones registradas que coincidan con la búsqueda.
            </div>
          ) : (
            evaluacionesFiltradas.map((e) => {
              const expandida = evaluacionExpandida === e.id;

              return (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-amber-400 transition-all"
                >
                  <div
                    onClick={() => setEvaluacionExpandida(expandida ? null : e.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/60"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          {e.metodo}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(e.creado_en).toLocaleString("es-CO")}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-gray-900">
                        {e.pareja_nombre}
                      </h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Evaluación de Juez Oficial (Confidencial en pantalla)</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[11px] text-gray-500 block uppercase font-bold">
                          Total Ponderado
                        </span>
                        <span className="text-2xl font-black text-amber-900">
                          {Number(e.total_ponderado).toFixed(3)}
                        </span>
                        <span className="text-xs text-gray-400"> / 5.000</span>
                      </div>
                      <div className="text-gray-400">
                        {expandida ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle Desplegable */}
                  {expandida && (
                    <div className="border-t border-gray-100 bg-stone-50 p-5 space-y-4 text-xs sm:text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-amber-900 block mb-1">
                            Presentación (30%): {Number(e.promedio_presentacion).toFixed(2)}
                          </span>
                          <ul className="space-y-1 text-gray-600 text-xs">
                            <li>Saludo: {e.pres_saludo}/5</li>
                            <li>Bienvenida: {e.pres_bienvenida}/5</li>
                            <li>Voz y tono: {e.pres_voz}/5</li>
                            <li>Expectativa: {e.pres_expectativa}/5</li>
                          </ul>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-amber-900 block mb-1">
                            Aspectos Técnicos (30%): {Number(e.promedio_tecnicos).toFixed(2)}
                          </span>
                          <ul className="space-y-1 text-gray-600 text-xs">
                            <li>Limpieza: {e.tec_limpieza}/5 · Purga: {e.tec_purga}/5</li>
                            <li>Pesaje: {e.tec_pesaje}/5 · Ratio: {e.tec_ratio}/5</li>
                            <li>Tiempos/Agua: {e.tec_tiempos_agua}/5 · Vertido: {e.tec_vertido}/5</li>
                            <li>Descripción: {e.tec_descripcion}/5 · Tazas: {e.tec_precalentamiento}/5</li>
                            <li>Tiempo prep: {e.tec_tiempo_prep}/5</li>
                          </ul>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-amber-900 block mb-1">
                            Sensorial (40%): {Number(e.promedio_sensorial).toFixed(2)}
                          </span>
                          <ul className="space-y-1 text-gray-600 text-xs">
                            <li>Aroma: {e.sens_aroma}/5 · Acidez: {e.sens_acidez}/5</li>
                            <li>Dulzor: {e.sens_dulzor}/5 · Amargo: {e.sens_amargo}/5</li>
                            <li>Limpieza taza: {e.sens_limpieza}/5</li>
                            <li>Cuerpo y textura: {e.sens_cuerpo ?? e.sens_cuerpo_sedoso ?? e.sens_cuerpo_inconsistente}/5</li>
                          </ul>
                        </div>
                      </div>

                      {e.comentarios && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                          <strong className="text-amber-900 text-xs block mb-0.5">
                            Comentarios u Observaciones:
                          </strong>
                          <p className="text-gray-700 italic text-xs">{e.comentarios}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Protección con Contraseña para Exportar Excel */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSuccess={handleConfirmDownload}
      />
    </div>
  );
}
