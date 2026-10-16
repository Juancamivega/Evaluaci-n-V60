import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { PAREJAS_PREDETERMINADAS } from "@/lib/constants";

export async function POST() {
  try {
    const supabase = await createClient();

    const insertData = PAREJAS_PREDETERMINADAS.map((nombre_pareja) => ({
      nombre_pareja,
    }));

    const { data, error } = await supabase
      .from("parejas")
      .upsert(insertData, { onConflict: "nombre_pareja" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al sembrar parejas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
