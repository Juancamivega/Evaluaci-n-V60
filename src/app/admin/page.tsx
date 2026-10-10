import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/AdminPanel";
import { connection } from "next/server";

export const instant = false;

export default async function AdminPage() {
  await connection();
  const supabase = await createClient();

  const { data: parejas } = await supabase
    .from("parejas")
    .select("*")
    .order("creado_en", { ascending: true });

  const { data: tokens } = await supabase
    .from("tokens_voto")
    .select("*")
    .order("creado_en", { ascending: false });

  // Fallback seguro en caso de que aún no hayan corrido el script SQL de configuración
  const { data: config } = await supabase
    .from("configuracion")
    .select("mostrar_resultados")
    .eq("id", 1)
    .single();

  const mostrarResultadosInicial = config?.mostrar_resultados ?? true; // Por defecto mostrar si no hay config

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 px-2 sm:px-4">
      <AdminPanel
        parejasIniciales={parejas || []}
        tokensIniciales={tokens || []}
        mostrarResultadosInicial={mostrarResultadosInicial}
      />
    </div>
  );
}
