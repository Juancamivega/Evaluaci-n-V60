import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  // Validate token exists and is not used
  const { data: token, error: tokenError } = await supabase
    .from("tokens_voto")
    .select("*")
    .eq("token", body.token)
    .single();

  if (tokenError || !token) {
    return NextResponse.json(
      { error: "Token inválido o no encontrado" },
      { status: 400 }
    );
  }

  if (token.usado) {
    return NextResponse.json(
      { error: "Este token ya fue utilizado" },
      { status: 400 }
    );
  }

  // Validate scores are in range
  const { aroma_pts, balance_pts, cuerpo_pts } = body;
  if (
    aroma_pts < 1 || aroma_pts > 5 ||
    balance_pts < 1 || balance_pts > 5 ||
    cuerpo_pts < 1 || cuerpo_pts > 5
  ) {
    return NextResponse.json(
      { error: "Los puntajes deben estar entre 1 y 5" },
      { status: 400 }
    );
  }

  // Insert evaluation
  const { data: evaluacion, error: evalError } = await supabase
    .from("evaluaciones")
    .insert({
      token_id: token.id,
      pareja_id: body.pareja_id,
      evaluador_nombre: body.evaluador_nombre,
      aroma_pts: body.aroma_pts,
      balance_pts: body.balance_pts,
      cuerpo_pts: body.cuerpo_pts,
      comentarios: body.comentarios || null,
    })
    .select()
    .single();

  if (evalError) {
    return NextResponse.json({ error: evalError.message }, { status: 500 });
  }

  // Mark token as used
  await supabase
    .from("tokens_voto")
    .update({ usado: true, nombre_evaluador: body.evaluador_nombre })
    .eq("id", token.id);

  return NextResponse.json(evaluacion, { status: 201 });
}
