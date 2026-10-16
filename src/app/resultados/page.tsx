import { createClient } from "@/lib/supabase/server";
import { ResultadosDashboard } from "@/components/ResultadosDashboard";
import { Navbar } from "@/components/Navbar";
import { connection } from "next/server";
import { Evaluacion, Pareja } from "@/lib/types";

export const instant = false;

export default async function ResultadosPage() {
  await connection();
  let evaluaciones: Evaluacion[] = [];
  let parejas: Pareja[] = [];

  try {
    const supabase = await createClient();
    const [evalsRes, parejasRes] = await Promise.all([
      supabase
        .from("evaluaciones")
        .select("*")
        .order("creado_en", { ascending: false }),
      supabase
        .from("parejas")
        .select("*")
        .order("nombre_pareja", { ascending: true }),
    ]);

    if (evalsRes.data) evaluaciones = evalsRes.data;
    if (parejasRes.data) parejas = parejasRes.data;
  } catch {
    evaluaciones = [];
    parejas = [];
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24">
        <ResultadosDashboard
          evaluacionesIniciales={evaluaciones}
          parejasDb={parejas}
        />
      </main>
      <footer className="text-center py-6 text-xs text-stone-500 border-t border-stone-200">
        SENA - Centro de la Industria la Empresa y los Servicios · Técnico en Servicios de Barismo
      </footer>
    </div>
  );
}
