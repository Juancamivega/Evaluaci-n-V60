"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Pareja } from "@/lib/types";
import {
  CATEGORIAS,
  PAREJAS_PREDETERMINADAS,
  METODOS_SUGERIDOS,
} from "@/lib/constants";
import { CriterioRating } from "@/components/CriterioRating";
import {
  Coffee,
  CheckCircle2,
  Send,
  Loader2,
  User,
  Sparkles,
  Calculator,
  RotateCcw,
  BarChart3,
  HelpCircle,
} from "lucide-react";

interface EvaluacionFormProps {
  parejasDb?: Pareja[];
}

export function EvaluacionForm({ parejasDb = [] }: EvaluacionFormProps) {
  // Lista de parejas: Si la BD tiene parejas, las usa; de lo contrario usa las 13 predeterminadas
  const listaParejas = useMemo(() => {
    if (parejasDb && parejasDb.length > 0) {
      return parejasDb.map((p) => p.nombre_pareja);
    }
    return PAREJAS_PREDETERMINADAS;
  }, [parejasDb]);

  // Form State
  const [parejaSeleccionada, setParejaSeleccionada] = useState("");
  const [evaluador, setEvaluador] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(METODOS_SUGERIDOS[0]);
  const [metodoPersonalizado, setMetodoPersonalizado] = useState("");

  // Scores state: Map of criterioId -> score (0 to 5)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CATEGORIAS.forEach((cat) => {
      cat.criterios.forEach((c) => {
        initial[c.id] = 0;
      });
    });
    return initial;
  });

  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    pareja: string;
    totalPonderado: number;
    promPresentacion: number;
    promTecnicos: number;
    promSensorial: number;
  } | null>(null);
  const [error, setError] = useState("");

  // Handler for score change
  function handleScoreChange(criterioId: string, val: number) {
    setScores((prev) => ({
      ...prev,
      [criterioId]: val,
    }));
  }

  // Cálculos en tiempo real
  const calculos = useMemo(() => {
    // 1. Presentación (4 criterios)
    const presCriterios = CATEGORIAS[0].criterios;
    const presSuma = presCriterios.reduce((acc, c) => acc + (scores[c.id] || 0), 0);
    const presRespondidos = presCriterios.filter((c) => (scores[c.id] || 0) > 0).length;
    const promPresentacion = presRespondidos > 0 ? presSuma / presCriterios.length : 0;

    // 2. Aspectos Técnicos (9 criterios)
    const tecCriterios = CATEGORIAS[1].criterios;
    const tecSuma = tecCriterios.reduce((acc, c) => acc + (scores[c.id] || 0), 0);
    const tecRespondidos = tecCriterios.filter((c) => (scores[c.id] || 0) > 0).length;
    const promTecnicos = tecRespondidos > 0 ? tecSuma / tecCriterios.length : 0;

    // 3. Sensorial (7 criterios)
    const sensCriterios = CATEGORIAS[2].criterios;
    const sensSuma = sensCriterios.reduce((acc, c) => acc + (scores[c.id] || 0), 0);
    const sensRespondidos = sensCriterios.filter((c) => (scores[c.id] || 0) > 0).length;
    const promSensorial = sensRespondidos > 0 ? sensSuma / sensCriterios.length : 0;

    // Total Ponderado: 30% Presentación + 30% Técnicos + 40% Sensorial
    const totalPonderado =
      promPresentacion * 0.3 + promTecnicos * 0.3 + promSensorial * 0.4;

    // Promedio simple para referencia
    const totalSimple = (promPresentacion + promTecnicos + promSensorial) / 3;

    const totalCriterios =
      presCriterios.length + tecCriterios.length + sensCriterios.length;
    const respondidosTotal = presRespondidos + tecRespondidos + sensRespondidos;
    const esCompleto = respondidosTotal === totalCriterios;

    return {
      presSuma,
      presRespondidos,
      promPresentacion,
      tecSuma,
      tecRespondidos,
      promTecnicos,
      sensSuma,
      sensRespondidos,
      promSensorial,
      totalPonderado,
      totalSimple,
      totalCriterios,
      respondidosTotal,
      esCompleto,
    };
  }, [scores]);

  const metodoFinal =
    metodoSeleccionado === "OTRO"
      ? metodoPersonalizado.trim()
      : metodoSeleccionado;

  const isValid =
    parejaSeleccionada.trim() !== "" &&
    evaluador.trim() !== "" &&
    metodoFinal.trim() !== "" &&
    calculos.esCompleto;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Por favor completa la información básica y califica todos los criterios de 1 a 5.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        pareja_nombre: parejaSeleccionada,
        evaluador: evaluador.trim(),
        metodo: metodoFinal,

        // Presentación
        pres_saludo: scores["pres_saludo"],
        pres_bienvenida: scores["pres_bienvenida"],
        pres_voz: scores["pres_voz"],
        pres_expectativa: scores["pres_expectativa"],
        promedio_presentacion: Number(calculos.promPresentacion.toFixed(2)),

        // Técnicos
        tec_limpieza: scores["tec_limpieza"],
        tec_purga: scores["tec_purga"],
        tec_pesaje: scores["tec_pesaje"],
        tec_ratio: scores["tec_ratio"],
        tec_tiempos_agua: scores["tec_tiempos_agua"],
        tec_vertido: scores["tec_vertido"],
        tec_descripcion: scores["tec_descripcion"],
        tec_precalentamiento: scores["tec_precalentamiento"],
        tec_tiempo_prep: scores["tec_tiempo_prep"],
        promedio_tecnicos: Number(calculos.promTecnicos.toFixed(2)),

        // Sensorial
        sens_aroma: scores["sens_aroma"],
        sens_acidez: scores["sens_acidez"],
        sens_dulzor: scores["sens_dulzor"],
        sens_amargo: scores["sens_amargo"],
        sens_limpieza: scores["sens_limpieza"],
        sens_cuerpo: scores["sens_cuerpo"],
        sens_cuerpo_sedoso: scores["sens_cuerpo"],
        sens_cuerpo_inconsistente: scores["sens_cuerpo"],
        promedio_sensorial: Number(calculos.promSensorial.toFixed(2)),

        // Totales
        total_ponderado: Number(calculos.totalPonderado.toFixed(3)),
        total_simple: Number(calculos.totalSimple.toFixed(3)),
        comentarios: comentarios.trim() || null,
      };

      const res = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error al guardar la evaluación.");
        return;
      }

      setSuccessData({
        pareja: parejaSeleccionada,
        totalPonderado: calculos.totalPonderado,
        promPresentacion: calculos.promPresentacion,
        promTecnicos: calculos.promTecnicos,
        promSensorial: calculos.promSensorial,
      });
    } catch {
      setError("Error de conexión. Verifica tu conexión a internet o la configuración de Supabase.");
    } finally {
      setLoading(false);
    }
  }

  function reiniciarFormulario() {
    setSuccessData(null);
    setParejaSeleccionada("");
    setScores(() => {
      const initial: Record<string, number> = {};
      CATEGORIAS.forEach((cat) => {
        cat.criterios.forEach((c) => {
          initial[c.id] = 0;
        });
      });
      return initial;
    });
    setComentarios("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Pantalla de Éxito
  if (successData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6 sm:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          ¡Evaluación Guardada con Éxito!
        </h2>
        <p className="text-gray-600 mb-6">
          Se registraron los puntajes en Supabase para{" "}
          <strong className="text-amber-900">{successData.pareja}</strong>.
        </p>

        {/* Resumen de Puntaje */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Presentación (30%):</span>
            <span className="font-bold text-gray-900">
              {successData.promPresentacion.toFixed(2)} / 5.00
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Aspectos Técnicos (30%):</span>
            <span className="font-bold text-gray-900">
              {successData.promTecnicos.toFixed(2)} / 5.00
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Preparación / Sensorial (40%):</span>
            <span className="font-bold text-gray-900">
              {successData.promSensorial.toFixed(2)} / 5.00
            </span>
          </div>
          <div className="border-t border-amber-200 pt-3 flex justify-between items-center">
            <span className="font-extrabold text-amber-900 text-base">
              Puntaje Total Ponderado:
            </span>
            <span className="text-2xl font-black text-amber-900">
              {successData.totalPonderado.toFixed(3)}{" "}
              <span className="text-sm font-normal text-gray-500">/ 5.000</span>
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reiniciarFormulario}
            className="flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-bold py-3 px-6 rounded-xl shadow transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Evaluar Otra Pareja
          </button>
          <Link
            href="/resultados"
            className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <BarChart3 className="h-4 w-4" /> Ver Tabla de Resultados
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Encabezado Institucional */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden border border-amber-800">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-700/20 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-amber-800/60 border border-amber-700/70 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          <Coffee className="h-3.5 w-3.5 text-amber-300" />
          SENA - Centro de la Industria la Empresa y los Servicios
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Técnico en Servicios de Barismo
        </h1>
        <p className="text-amber-200 text-sm sm:text-base font-medium mt-1">
          Formato Oficial de Evaluación de Taza
        </p>

        {/* Info badges */}
        <div className="grid grid-cols-3 gap-2 mt-5 max-w-lg mx-auto text-center text-xs">
          <div className="bg-amber-900/60 border border-amber-800/80 rounded-lg p-2">
            <span className="block font-bold text-amber-300">30%</span>
            <span className="text-amber-200/90">Presentación</span>
          </div>
          <div className="bg-amber-900/60 border border-amber-800/80 rounded-lg p-2">
            <span className="block font-bold text-amber-300">30%</span>
            <span className="text-amber-200/90">Técnicos</span>
          </div>
          <div className="bg-amber-900/60 border border-amber-800/80 rounded-lg p-2">
            <span className="block font-bold text-amber-300">40%</span>
            <span className="text-amber-200/90">Sensorial</span>
          </div>
        </div>
      </div>

      {/* Datos Básicos de la Evaluación (Campos Solicitados) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <User className="h-4 w-4 text-amber-700" />
          Datos Generales de la Evaluación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pareja Evaluada (Dropdown con las 13 parejas) */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Pareja Evaluada <span className="text-rose-500">*</span>
            </label>
            <select
              value={parejaSeleccionada}
              onChange={(e) => setParejaSeleccionada(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-amber-600 focus:outline-none transition-colors bg-white shadow-sm"
              required
            >
              <option value="">-- Selecciona la pareja --</option>
              {listaParejas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluador (Texto libre) */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Evaluador(a) / Juez <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={evaluador}
              onChange={(e) => setEvaluador(e.target.value)}
              placeholder="Nombre del evaluador"
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-amber-600 focus:outline-none transition-colors bg-white shadow-sm"
              required
            />
          </div>

          {/* Método o Dispositivo (Dropdown preparado + libre) */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Método o Dispositivo <span className="text-rose-500">*</span>
            </label>
            <select
              value={metodoSeleccionado}
              onChange={(e) => setMetodoSeleccionado(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-amber-600 focus:outline-none transition-colors bg-white shadow-sm"
              required
            >
              {METODOS_SUGERIDOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="OTRO">Otro método (Escribir personalizado)...</option>
            </select>
          </div>
        </div>

        {/* Si selecciona "OTRO", mostrar input de método libre */}
        {metodoSeleccionado === "OTRO" && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-amber-800 mb-1">
              Especifica el Método o Dispositivo:
            </label>
            <input
              type="text"
              value={metodoPersonalizado}
              onChange={(e) => setMetodoPersonalizado(e.target.value)}
              placeholder="Ej: Origami Dripper, Kalita Wave, etc."
              className="w-full rounded-xl border-2 border-amber-300 p-3 text-sm text-gray-900 bg-amber-50/50 focus:border-amber-600 focus:outline-none transition-colors shadow-sm"
              required
            />
          </div>
        )}
      </div>

      {/* Escala Guía */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-amber-700 flex-shrink-0" />
          <span className="font-semibold">Escala de Calificación:</span>
          <span className="hidden sm:inline text-amber-800">
            1 = Deficiente · 2 = Regular · 3 = Aceptable · 4 = Bueno · 5 = Excelente
          </span>
        </div>
        <div className="font-bold text-amber-950">
          {calculos.respondidosTotal}/{calculos.totalCriterios} respondidas
        </div>
      </div>

      {/* SECCIÓN 1: PRESENTACIÓN (30%) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-md">
                30% Ponderación
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                1. PRESENTACIÓN
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              4 criterios · Actitud, postura, comunicación y ambientación
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-amber-800 block">Promedio Sección</span>
            <span className="text-xl font-bold text-amber-900">
              {calculos.promPresentacion.toFixed(2)}{" "}
              <span className="text-xs font-normal text-gray-500">/ 5.0</span>
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {CATEGORIAS[0].criterios.map((criterio, i) => (
            <CriterioRating
              key={criterio.id}
              id={criterio.id}
              index={i + 1}
              label={criterio.label}
              valor={scores[criterio.id] || 0}
              onChange={(val) => handleScoreChange(criterio.id, val)}
            />
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: ASPECTOS TÉCNICOS (30%) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-md">
                30% Ponderación
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                2. ASPECTOS TÉCNICOS
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              9 criterios · Higiene, purga, ratio, tiempos y vertido
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-amber-800 block">Promedio Sección</span>
            <span className="text-xl font-bold text-amber-900">
              {calculos.promTecnicos.toFixed(2)}{" "}
              <span className="text-xs font-normal text-gray-500">/ 5.0</span>
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {CATEGORIAS[1].criterios.map((criterio, i) => (
            <CriterioRating
              key={criterio.id}
              id={criterio.id}
              index={i + 1}
              label={criterio.label}
              valor={scores[criterio.id] || 0}
              onChange={(val) => handleScoreChange(criterio.id, val)}
            />
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: PREPARACIÓN / EVALUACIÓN SENSORIAL (40%) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-md">
                40% Ponderación
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                3. PREPARACIÓN / EVALUACIÓN SENSORIAL
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              6 criterios · Aroma, acidez, dulzor, residual, limpieza y textura de taza
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
            <span className="text-xs text-amber-800 block">Promedio Sección</span>
            <span className="text-xl font-bold text-amber-900">
              {calculos.promSensorial.toFixed(2)}{" "}
              <span className="text-xs font-normal text-gray-500">/ 5.0</span>
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {CATEGORIAS[2].criterios.map((criterio, i) => (
            <CriterioRating
              key={criterio.id}
              id={criterio.id}
              index={i + 1}
              label={criterio.label}
              valor={scores[criterio.id] || 0}
              onChange={(val) => handleScoreChange(criterio.id, val)}
            />
          ))}
        </div>
      </div>

      {/* TARJETA DE TOTAL PONDERADO EN VIVO */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-stone-900 text-white rounded-2xl shadow-xl p-6 border border-amber-700/60">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                TOTAL PUNTAJE DE LA EVALUACIÓN
              </h3>
            </div>
            <p className="text-xs text-amber-200/80 max-w-md">
              Fórmula Ponderada Oficial: (Presentación × 0.30) + (Aspectos Técnicos × 0.30) + (Sensorial × 0.40)
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
              Puntaje Ponderado Final
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-4xl sm:text-5xl font-black text-amber-400">
                {calculos.totalPonderado.toFixed(3)}
              </span>
              <span className="text-base text-amber-200/70 font-light">
                / 5.000
              </span>
            </div>
            <span className="text-xs text-amber-300/60 block mt-0.5">
              Promedio simple: {calculos.totalSimple.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Comentarios u Observaciones */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Comentarios u Observaciones de la Taza (Opcional)
        </label>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Notas de cata, felicitaciones o recomendaciones para la pareja..."
          rows={3}
          className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm text-gray-900 focus:border-amber-600 focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-800 text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Botón Guardar Evaluación */}
      <div className="sticky bottom-4 z-20">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-amber-900 hover:bg-amber-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-extrabold py-4 px-6 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 text-base sm:text-lg border border-amber-800"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Guardando en Supabase...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Enviar Evaluación de Taza
            </>
          )}
        </button>
      </div>
    </form>
  );
}
