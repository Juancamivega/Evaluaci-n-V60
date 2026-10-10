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

  return (
    <div className="min-h-screen bg-amber-50 py-6 px-4">
      <AdminPanel
        parejasIniciales={parejas || []}
        tokensIniciales={tokens || []}
      />
    </div>
  );
}
