"use client";

import { useState } from "react";
import { TokenVoto } from "@/lib/types";
import { Key, Copy, Check, Loader2, Trash2, ExternalLink } from "lucide-react";

interface TokenGeneratorProps {
  tokens: TokenVoto[];
  setTokens: React.Dispatch<React.SetStateAction<TokenVoto[]>>;
}

export function TokenGenerator({ tokens, setTokens }: TokenGeneratorProps) {
  const [nombreEvaluador, setNombreEvaluador] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_evaluador: nombreEvaluador.trim() || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setTokens((prev) => [data, ...prev]);
        setNombreEvaluador("");
      }
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tokens?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // Error silencioso
    } finally {
      setDeletingId(null);
    }
  }

  function getLink(token: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/evaluar/${token}`;
    }
    return `/evaluar/${token}`;
  }

  async function copyLink(token: TokenVoto) {
    const link = getLink(token.token);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(token.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(token.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <Key className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-bold text-gray-900">Tokens de Evaluación</h2>
        <span className="ml-auto text-sm text-gray-500">{tokens.length} generados</span>
      </div>

      {/* Generate form */}
      <div className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <input
          type="text"
          value={nombreEvaluador}
          onChange={(e) => setNombreEvaluador(e.target.value)}
          placeholder="Nombre del evaluador (opcional)"
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
          Generar Token
        </button>
      </div>

      {/* Tokens list */}
      <div className="divide-y divide-gray-100">
        {tokens.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            No hay tokens generados. Genera el primero.
          </div>
        ) : (
          tokens.map((t) => (
            <div
              key={t.id}
              className={`px-6 py-3 flex items-center gap-3 transition-colors ${
                t.usado ? "bg-gray-50 opacity-60" : "hover:bg-amber-50"
              }`}
            >
              {/* Status indicator */}
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                  t.usado ? "bg-gray-400" : "bg-green-500"
                }`}
                title={t.usado ? "Usado" : "Disponible"}
              />

              {/* Token info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700 truncate max-w-48">
                    {t.token.substring(0, 8)}...
                  </code>
                  {t.usado && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      Usado
                    </span>
                  )}
                  {!t.usado && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Disponible
                    </span>
                  )}
                </div>
                {t.nombre_evaluador && (
                  <p className="text-xs text-gray-500 mt-0.5">{t.nombre_evaluador}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!t.usado && (
                  <>
                    <button
                      onClick={() => copyLink(t)}
                      className="text-gray-400 hover:text-amber-600 transition-colors p-1.5 rounded-lg hover:bg-amber-50"
                      title="Copiar enlace"
                    >
                      {copiedId === t.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={`/evaluar/${t.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-600 transition-colors p-1.5 rounded-lg hover:bg-amber-50"
                      title="Abrir enlace"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </>
                )}
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  title="Eliminar token"
                >
                  {deletingId === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
