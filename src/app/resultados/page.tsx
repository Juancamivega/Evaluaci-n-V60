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

  const { data: config } = await supabase
    .from("configuracion")
    .select("mostrar_resultados")
    .eq("id", 1)
    .single();

  const mostrarResultadosInicial = config?.mostrar_resultados ?? false;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <ResultadosDashboard
        evaluacionesIniciales={evaluaciones || []}
        parejasData={parejas || []}
        mostrarResultadosInicial={mostrarResultadosInicial}
      />
    </div>
  );
}
