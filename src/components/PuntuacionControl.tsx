"use client";

interface PuntuacionControlProps {
  titulo: string;
  subtitulo: string;
  valor: number;
  onChange: (v: number) => void;
  descriptorBajo: string;
  descriptorAlto: string;
  colorAccent: "amber" | "orange" | "yellow";
}

export function PuntuacionControl({
  titulo,
  subtitulo,
  valor,
  onChange,
  descriptorBajo,
  descriptorAlto,
}: PuntuacionControlProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-amber-900">{titulo}</h3>
        <p className="text-xs text-gray-500">{subtitulo}</p>
      </div>

      {/* Score buttons */}
      <div className="flex justify-center gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-14 h-14 rounded-full text-lg font-bold transition-all duration-200 border-2 ${
              valor === n
                ? n <= 2
                  ? "bg-red-500 border-red-500 text-white scale-110 shadow-lg"
                  : "bg-green-600 border-green-600 text-white scale-110 shadow-lg"
                : "bg-white border-gray-300 text-gray-600 hover:border-amber-400 hover:bg-amber-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Descriptors */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <span className="font-semibold text-red-700">1-2 pts:</span>
          <p className="text-red-600 mt-0.5">{descriptorBajo}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <span className="font-semibold text-green-700">3-5 pts:</span>
          <p className="text-green-600 mt-0.5">{descriptorAlto}</p>
        </div>
      </div>
    </div>
  );
}
