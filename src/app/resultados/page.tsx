import { createClient } from "@/lib/supabase/server";
import { ResultadosDashboard } from "@/components/ResultadosDashboard";
import { connection } from "next/server";

export const instant = false;

export default async function ResultadosPage() {
  await connection();
  const supabase = await createClient();

  const { data: evaluaciones } = await supabase
    .from("evaluaciones")
    .select("*, parejas(nombre_pareja)")
    .order("creado_en", { ascending: false });

  const { data: parejas } = await supabase
    .from("parejas")
    .select("*")
    .order("nombre_pareja", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ResultadosDashboard
        evaluacionesIniciales={evaluaciones || []}
        parejasData={parejas || []}
      />
    </div>
  );
}
