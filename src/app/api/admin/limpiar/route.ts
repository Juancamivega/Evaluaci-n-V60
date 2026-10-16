import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (body.confirmacion !== "REINICIAR") {
      return NextResponse.json(
        { error: "Confirmación inválida. Escribe REINICIAR para confirmar." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("evaluaciones")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Evaluaciones reiniciadas" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al reiniciar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
