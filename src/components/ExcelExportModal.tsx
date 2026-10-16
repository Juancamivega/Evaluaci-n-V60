"use client";

import { useState } from "react";
import { Lock, FileSpreadsheet, X, KeyRound, AlertCircle } from "lucide-react";

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelExportModal({
  isOpen,
  onClose,
  onSuccess,
}: ExcelExportModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().toLowerCase() === "jerson") {
      setError(false);
      setPassword("");
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  }

  function handleClose() {
    setPassword("");
    setError(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 sm:p-7 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
          title="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-800">
          <Lock className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-extrabold text-stone-900 mb-1">
          Descarga Protegida con Contraseña
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
          Para garantizar la cata a ciegas, los nombres de los evaluadores están reservados para organizadores. Ingresa la clave para exportar el reporte oficial en Excel:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                placeholder="Ingresa la contraseña..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border-2 border-stone-300 focus:border-amber-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Contraseña incorrecta. Solo organizadores autorizados pueden descargar este reporte.</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-sm shadow-md transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Descargar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
