import { createClient } from "@/lib/supabase/server";
import { EvaluacionForm } from "@/components/EvaluacionForm";
import { AlertTriangle, XCircle } from "lucide-react";

export const instant = false;

export default async function EvaluarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Validate token
  const { data: tokenData, error } = await supabase
    .from("tokens_voto")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Token Inválido</h1>
          <p className="text-gray-600">
            El enlace de evaluación no es válido. Verifica que hayas copiado correctamente el enlace proporcionado.
          </p>
        </div>
      </div>
    );
  }

  if (tokenData.usado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Token Ya Utilizado</h1>
          <p className="text-gray-600">
            Este enlace de evaluación ya fue utilizado. Cada token solo puede usarse una vez.
          </p>
          {tokenData.nombre_evaluador && (
            <p className="mt-3 text-sm text-gray-500">
              Evaluado por: <span className="font-medium">{tokenData.nombre_evaluador}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Fetch parejas for the form
  const { data: parejas } = await supabase
    .from("parejas")
    .select("*")
    .order("nombre_pareja", { ascending: true });

  return (
    <div className="min-h-screen bg-amber-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <EvaluacionForm
          token={token}
          parejas={parejas || []}
          evaluadorNombre={tokenData.nombre_evaluador || ""}
        />
      </div>
    </div>
  );
}
