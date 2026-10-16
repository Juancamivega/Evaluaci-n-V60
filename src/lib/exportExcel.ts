import * as XLSX from "xlsx";
import { Evaluacion, ParejaResumenStats } from "@/lib/types";

export function exportarEvaluacionesAExcel(
  evaluaciones: Evaluacion[],
  stats: ParejaResumenStats[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Hoja de Resumen Ponderado de Parejas
  const resumenRows = stats.map((s, index) => ({
    "Posición": s.totalEvaluaciones > 0 ? index + 1 : "—",
    "Pareja Evaluada": s.nombre,
    "N° Evaluaciones": s.totalEvaluaciones,
    "Presentación (30%)": s.totalEvaluaciones > 0 ? Number(s.promedioPresentacion.toFixed(2)) : "—",
    "Aspectos Técnicos (30%)": s.totalEvaluaciones > 0 ? Number(s.promedioTecnicos.toFixed(2)) : "—",
    "Preparación / Sensorial (40%)": s.totalEvaluaciones > 0 ? Number(s.promedioSensorial.toFixed(2)) : "—",
    "TOTAL PONDERADO": s.totalEvaluaciones > 0 ? Number(s.promedioTotalPonderado.toFixed(3)) : "—",
    "Promedio Simple": s.totalEvaluaciones > 0 ? Number(s.promedioTotalSimple.toFixed(3)) : "—",
    "Métodos Utilizados": s.metodosUtilizados.join(", "),
    "Evaluadores": s.evaluadores.join(", "),
  }));

  const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");

  // 2. Hoja de Evaluaciones Detalladas (cada evaluación individual)
  const detalleRows = evaluaciones.map((e, index) => ({
    "N°": index + 1,
    "Fecha y Hora": new Date(e.creado_en).toLocaleString("es-CO"),
    "Pareja": e.pareja_nombre,
    "Evaluador(a)": e.evaluador,
    "Método / Dispositivo": e.metodo,

    // Presentación (30%)
    "1.1 Saludo": e.pres_saludo,
    "1.2 Bienvenida": e.pres_bienvenida,
    "1.3 Voz y tono": e.pres_voz,
    "1.4 Expectativa": e.pres_expectativa,
    "Subtotal Presentación": Number(e.promedio_presentacion),

    // Aspectos Técnicos (30%)
    "2.1 Limpieza estación": e.tec_limpieza,
    "2.2 Purga equipos": e.tec_purga,
    "2.3 Manejo y pesaje": e.tec_pesaje,
    "2.4 Claridad ratio": e.tec_ratio,
    "2.5 Control tiempos y agua": e.tec_tiempos_agua,
    "2.6 Técnica vertido": e.tec_vertido,
    "2.7 Descripción sensorial": e.tec_descripcion,
    "2.8 Precalentamiento tazas": e.tec_precalentamiento,
    "2.9 Tiempo preparación": e.tec_tiempo_prep,
    "Subtotal Aspectos Técnicos": Number(e.promedio_tecnicos),

    // Sensorial (40%)
    "3.1 Aroma": e.sens_aroma,
    "3.2 Acidez": e.sens_acidez,
    "3.3 Dulzor": e.sens_dulzor,
    "3.4 Residual amargo": e.sens_amargo,
    "3.5 Limpieza de taza": e.sens_limpieza,
    "3.6 Cuerpo y textura (1:Aguado - 5:Sedoso)": e.sens_cuerpo ?? e.sens_cuerpo_sedoso ?? e.sens_cuerpo_inconsistente,
    "Subtotal Preparación / Sensorial": Number(e.promedio_sensorial),

    // Totales
    "TOTAL PONDERADO (30/30/40)": Number(e.total_ponderado),
    "Promedio Simple": e.total_simple ? Number(e.total_simple) : "—",
    "Comentarios u Observaciones": e.comentarios || "",
  }));

  const wsDetalle = XLSX.utils.json_to_sheet(detalleRows);
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Evaluaciones Individuales");

  // Descargar archivo
  const fechaStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `SENA_Evaluacion_Barismo_${fechaStr}.xlsx`);
}
