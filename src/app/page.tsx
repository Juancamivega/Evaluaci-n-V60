import Link from "next/link";
import { Coffee, ClipboardList, BarChart3, Settings } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-amber-900 p-4 rounded-2xl shadow-lg">
              <Coffee className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Ficha de Cata Rápida
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Sistema de evaluación para la competencia de filtrado V60 — Clase de Barismo
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin"
            className="group bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
          >
            <Settings className="mx-auto h-10 w-10 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-gray-900 text-lg">Admin</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestionar parejas y generar tokens
            </p>
          </Link>

          <Link
            href="/resultados"
            className="group bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
          >
            <BarChart3 className="mx-auto h-10 w-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-gray-900 text-lg">Resultados</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ver puntajes en tiempo real
            </p>
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 opacity-75">
            <ClipboardList className="mx-auto h-10 w-10 text-blue-600 mb-3" />
            <h2 className="font-bold text-gray-900 text-lg">Evaluar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Accede con tu token de evaluación
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Los evaluadores acceden directamente con su enlace personalizado generado desde el panel de administración.
        </p>
      </div>
    </div>
  );
}
