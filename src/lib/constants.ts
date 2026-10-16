export interface CriterioDef {
  id: string;
  label: string;
  description?: string;
}

export interface CategoriaDef {
  id: "presentacion" | "tecnicos" | "sensorial";
  titulo: string;
  pesoPct: number; // e.g. 30, 30, 40
  criterios: CriterioDef[];
}

export const PAREJAS_PREDETERMINADAS: string[] = [
  "ANGEL Y SOFIA",
  "J. CAMILO Y TATIANA",
  "MAICOL Y JERSON",
  "KELLY Y BARBARA",
  "DIANA Z Y FRITZ",
  "EDDY Y DIANA M",
  "ADRIANA Y  EMILIANO",
  "LAURA Y LILIANA",
  "ZAHIRA Y LUIS ALBERTO",
  "KEVIN Y RAMIRO",
  "LORENA Y JESSICA",
  "STIVEN Y KIMBERLY",
  "BRAYAN Y JUAN JOSÉ",
];

export const METODOS_SUGERIDOS: string[] = [
  "V60 (Hario)",
  "Chemex",
  "Aeropress",
  "Prensa Francesa",
  "Sifón Japonés",
  "Kalita Wave",
  "Origami Dripper",
  "Clever Dripper",
  "Cafetera Moka (Italiana)",
  "Espresso",
];

export const CATEGORIAS: CategoriaDef[] = [
  {
    id: "presentacion",
    titulo: "1. PRESENTACIÓN",
    pesoPct: 30,
    criterios: [
      { id: "pres_saludo", label: "Saludo (Establece conexión)" },
      { id: "pres_bienvenida", label: "Bienvenida Cálida" },
      { id: "pres_voz", label: "Voz clara y tono pausado" },
      { id: "pres_expectativa", label: "Genera Expectativa Eleva la experiencia del café" },
    ],
  },
  {
    id: "tecnicos",
    titulo: "2. ASPECTOS TÉCNICOS",
    pesoPct: 30,
    criterios: [
      { id: "tec_limpieza", label: "Limpieza y orden de la estación" },
      { id: "tec_purga", label: "Purga de equipos y utensilios" },
      { id: "tec_pesaje", label: "Manejo y pesaje del café" },
      { id: "tec_ratio", label: "Claridad en el ratio" },
      { id: "tec_tiempos_agua", label: "Control de tiempos y cantidad de agua" },
      { id: "tec_vertido", label: "Técnica de Vertido" },
      { id: "tec_descripcion", label: "Descripción sensorial" },
      { id: "tec_precalentamiento", label: "Precalentamiento de tazas" },
      { id: "tec_tiempo_prep", label: "Tiempo de preparación" },
    ],
  },
  {
    id: "sensorial",
    titulo: "3. PREPARACIÓN / EVALUACIÓN SENSORIAL",
    pesoPct: 40,
    criterios: [
      { id: "sens_aroma", label: "Aroma (Intensidad, frescura, agrado)" },
      { id: "sens_acidez", label: "Acidez" },
      { id: "sens_dulzor", label: "Dulzor" },
      { id: "sens_amargo", label: "Residual amargo" },
      { id: "sens_limpieza", label: "Limpieza de Taza" },
      { id: "sens_cuerpo", label: "Cuerpo y textura (1: Aguado / Inconsistente — 5: Sedoso / Redondo)" },
    ],
  },
];
