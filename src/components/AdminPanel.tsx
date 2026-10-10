"use client";

import { useState } from "react";
import { ParejasManager } from "@/components/ParejasManager";
import { TokenGenerator } from "@/components/TokenGenerator";
import { Pareja, TokenVoto } from "@/lib/types";
import { Settings, Coffee } from "lucide-react";

interface AdminPanelProps {
  parejasIniciales: Pareja[];
  tokensIniciales: TokenVoto[];
}

export function AdminPanel({ parejasIniciales, tokensIniciales }: AdminPanelProps) {
  const [parejas, setParejas] = useState<Pareja[]>(parejasIniciales);
  const [tokens, setTokens] = useState<TokenVoto[]>(tokensIniciales);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-500 flex items-center justify-center gap-1">
          <Coffee className="h-4 w-4" />
          Competencia de Filtrado V60
        </p>
      </div>

      {/* Parejas Manager */}
      <ParejasManager parejas={parejas} setParejas={setParejas} />

      {/* Token Generator */}
      <TokenGenerator tokens={tokens} setTokens={setTokens} />
    </div>
  );
}
