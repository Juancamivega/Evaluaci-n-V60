"use client";

interface CriterioRatingProps {
  id: string;
  index: number;
  label: string;
  valor: number;
  onChange: (val: number) => void;
}

export function CriterioRating({
  label,
  valor,
  onChange,
}: CriterioRatingProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-sm hover:border-amber-400 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Label */}
        <div className="flex-1 pr-2">
          <p className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
            {label}
          </p>
        </div>

        {/* 1-5 Rating Scale */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center">
          {[1, 2, 3, 4, 5].map((n) => {
            const isSelected = valor === n;
            let activeColor = "bg-amber-600 border-amber-600 text-white shadow-md scale-105";
            if (n <= 2) {
              activeColor = "bg-rose-600 border-rose-600 text-white shadow-md scale-105";
            } else if (n === 3) {
              activeColor = "bg-amber-500 border-amber-500 text-white shadow-md scale-105";
            } else {
              activeColor = "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105";
            }

            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-label={`Calificar ${n} de 5`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm sm:text-base font-bold transition-all border flex items-center justify-center ${
                  isSelected
                    ? activeColor
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300"
                }`}
              >
                {n}
              </button>
            );
          })}

          <div className="ml-1 sm:ml-2 min-w-7 text-right">
            <span
              className={`text-xs sm:text-sm font-extrabold ${
                valor === 0
                  ? "text-gray-300"
                  : valor <= 2
                  ? "text-rose-600"
                  : valor === 3
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {valor > 0 ? `${valor}/5` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
