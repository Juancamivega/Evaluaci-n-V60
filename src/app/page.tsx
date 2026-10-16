import { createClient } from "@/lib/supabase/server";
import { EvaluacionForm } from "@/components/EvaluacionForm";
import { Navbar } from "@/components/Navbar";
import { connection } from "next/server";
import { Pareja } from "@/lib/types";

export const instant = false;

export default async function HomePage() {
  await connection();
  let parejas: Pareja[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("parejas")
      .select("*")
      .order("nombre_pareja", { ascending: true });
    if (data) {
      parejas = data;
    }
  } catch {
    parejas = [];
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24">
        <EvaluacionForm parejasDb={parejas} />
      </main>
      <footer className="text-center py-6 text-xs text-stone-500 border-t border-stone-200">
        SENA - Centro de la Industria la Empresa y los Servicios · Técnico en Servicios de Barismo
      </footer>
    </div>
  );
}
