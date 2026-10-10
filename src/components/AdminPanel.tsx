"use client";

import { useState } from "react";
import { ParejasManager } from "@/components/ParejasManager";
import { TokenGenerator } from "@/components/TokenGenerator";
import { Pareja, TokenVoto } from "@/lib/types";
import { Settings, Coffee, Eye, EyeOff, Loader2 } from "lucide-react";

interface AdminPanelProps {
  parejasIniciales: Pareja[];
  tokensIniciales: TokenVoto[];
  mostrarResultadosInicial: boolean;
}

export function AdminPanel({ parejasIniciales, tokensIniciales, mostrarResultadosInicial }: AdminPanelProps) {
  const [parejas, setParejas] = useState<Pareja[]>(parejasIniciales);
  const [tokens, setTokens] = useState<TokenVoto[]>(tokensIniciales);
  const [mostrarResultados, setMostrarResultados] = useState(mostrarResultadosInicial);
  const [loadingConfig, setLoadingConfig] = useState(false);

  async function toggleResultados() {
    setLoadingConfig(true);
    try {
      const nuevoEstado = !mostrarResultados;
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mostrar_resultados: nuevoEstado }),
      });
      if (res.ok) {
        setMostrarResultados(nuevoEstado);
      }
    } catch {
      // Error silencioso
    } finally {
      setLoadingConfig(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Header */}
      <div className="text-center py-2 sm:py-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-500 flex items-center justify-center gap-1 text-sm sm:text-base">
          <Coffee className="h-4 w-4" />
          Competencia V60
        </p>
      </div>

      {/* Visibilidad de Resultados Toggle */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Control de Resultados</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Mantén los resultados ocultos para generar expectativa. Desbloquéalos al final para revelar al ganador.
        </p>
        
        <button
          onClick={toggleResultados}
          disabled={loadingConfig}
          className={`relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-white transition-all shadow-md ${
            mostrarResultados 
              ? "bg-green-500 hover:bg-green-600 shadow-green-500/30" 
              : "bg-gray-800 hover:bg-gray-900 shadow-gray-900/30"
          }`}
        >
          {loadingConfig ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : mostrarResultados ? (
            <><Eye className="h-5 w-5 mr-2" /> Resultados PÚBLICOS</>
          ) : (
            <><EyeOff className="h-5 w-5 mr-2" /> Resultados OCULTOS</>
          )}
        </button>
      </div>

      {/* Parejas Manager */}
      <ParejasManager parejas={parejas} setParejas={setParejas} />

      {/* Token Generator */}
      <TokenGenerator tokens={tokens} setTokens={setTokens} />
    </div>
  );
}
