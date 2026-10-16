import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      pareja_nombre,
      evaluador,
      metodo,
      // Presentación
      pres_saludo,
      pres_bienvenida,
      pres_voz,
      pres_expectativa,
      // Técnicos
      tec_limpieza,
      tec_purga,
      tec_pesaje,
      tec_ratio,
      tec_tiempos_agua,
      tec_vertido,
      tec_descripcion,
      tec_precalentamiento,
      tec_tiempo_prep,
      // Sensorial
      sens_aroma,
      sens_acidez,
      sens_dulzor,
      sens_amargo,
      sens_limpieza,
      sens_cuerpo,
      sens_cuerpo_inconsistente,
      sens_cuerpo_sedoso,
      comentarios,
    } = body;

    if (!pareja_nombre || !evaluador || !metodo) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: Pareja, Evaluador o Método." },
        { status: 400 }
      );
    }

    const cuerpoVal =
      typeof sens_cuerpo === "number"
        ? sens_cuerpo
        : typeof sens_cuerpo_sedoso === "number"
        ? sens_cuerpo_sedoso
        : sens_cuerpo_inconsistente;

    const allScores = [
      pres_saludo,
      pres_bienvenida,
      pres_voz,
      pres_expectativa,
      tec_limpieza,
      tec_purga,
      tec_pesaje,
      tec_ratio,
      tec_tiempos_agua,
      tec_vertido,
      tec_descripcion,
      tec_precalentamiento,
      tec_tiempo_prep,
      sens_aroma,
      sens_acidez,
      sens_dulzor,
      sens_amargo,
      sens_limpieza,
      cuerpoVal,
    ];

    const hasInvalidScore = allScores.some(
      (s) => typeof s !== "number" || s < 1 || s > 5
    );

    if (hasInvalidScore) {
      return NextResponse.json(
        { error: "Todos los criterios deben ser calificados en una escala de 1 a 5." },
        { status: 400 }
      );
    }

    // Calcular promedios oficiales y ponderación precisa en el servidor
    const promPres =
      (pres_saludo + pres_bienvenida + pres_voz + pres_expectativa) / 4;

    const promTec =
      (tec_limpieza +
        tec_purga +
        tec_pesaje +
        tec_ratio +
        tec_tiempos_agua +
        tec_vertido +
        tec_descripcion +
        tec_precalentamiento +
        tec_tiempo_prep) /
      9;

    // Sensorial: 6 criterios (Aroma, Acidez, Dulzor, Amargo, Limpieza, Cuerpo)
    const promSens =
      (sens_aroma +
        sens_acidez +
        sens_dulzor +
        sens_amargo +
        sens_limpieza +
        cuerpoVal) /
      6;

    // Ponderación: 30% Presentación + 30% Técnicos + 40% Sensorial
    const totalPonderado = promPres * 0.3 + promTec * 0.3 + promSens * 0.4;
    const totalSimple = (promPres + promTec + promSens) / 3;

    // Buscar si existe el id de la pareja en la base de datos
    let parejaId: string | null = null;
    const { data: parejaData } = await supabase
      .from("parejas")
      .select("id")
      .eq("nombre_pareja", pareja_nombre.trim())
      .maybeSingle();

    if (parejaData) {
      parejaId = parejaData.id;
    }

    // Payload de inserción
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertPayload: any = {
      pareja_id: parejaId,
      pareja_nombre: pareja_nombre.trim(),
      evaluador: evaluador.trim(),
      metodo: metodo.trim(),

      pres_saludo,
      pres_bienvenida,
      pres_voz,
      pres_expectativa,
      promedio_presentacion: Number(promPres.toFixed(2)),

      tec_limpieza,
      tec_purga,
      tec_pesaje,
      tec_ratio,
      tec_tiempos_agua,
      tec_vertido,
      tec_descripcion,
      tec_precalentamiento,
      tec_tiempo_prep,
      promedio_tecnicos: Number(promTec.toFixed(2)),

      sens_aroma,
      sens_acidez,
      sens_dulzor,
      sens_amargo,
      sens_limpieza,
      sens_cuerpo: cuerpoVal,
      sens_cuerpo_sedoso: cuerpoVal,
      sens_cuerpo_inconsistente: cuerpoVal,
      promedio_sensorial: Number(promSens.toFixed(2)),

      total_ponderado: Number(totalPonderado.toFixed(3)),
      total_simple: Number(totalSimple.toFixed(3)),
      comentarios: comentarios ? comentarios.trim() : null,
    };

    // Intentar inserción
    let { data: evaluacion, error: evalError } = await supabase
      .from("evaluaciones")
      .insert(insertPayload)
      .select()
      .single();

    // Fallback: Si la tabla en Supabase no tiene la columna sens_cuerpo aún, reintentar sin ella
    if (evalError && (evalError.message.includes("sens_cuerpo") || evalError.code === "PGRST204")) {
      delete insertPayload.sens_cuerpo;
      const retry = await supabase
        .from("evaluaciones")
        .insert(insertPayload)
        .select()
        .single();
      if (!retry.error) {
        evaluacion = retry.data;
        evalError = null;
      } else {
        evalError = retry.error;
      }
    }

    if (evalError) {
      return NextResponse.json({ error: evalError.message }, { status: 500 });
    }

    return NextResponse.json(evaluacion, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
