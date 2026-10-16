export type Database = {
  public: {
    Tables: {
      parejas: {
        Row: {
          id: string;
          nombre_pareja: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre_pareja: string;
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre_pareja?: string;
          creado_en?: string;
        };
        Relationships: [];
      };
      evaluaciones: {
        Row: {
          id: string;
          pareja_id: string | null;
          pareja_nombre: string;
          evaluador: string;
          metodo: string;
          // Presentación
          pres_saludo: number;
          pres_bienvenida: number;
          pres_voz: number;
          pres_expectativa: number;
          promedio_presentacion: number;
          // Técnicos
          tec_limpieza: number;
          tec_purga: number;
          tec_pesaje: number;
          tec_ratio: number;
          tec_tiempos_agua: number;
          tec_vertido: number;
          tec_descripcion: number;
          tec_precalentamiento: number;
          tec_tiempo_prep: number;
          promedio_tecnicos: number;
          // Sensorial
          sens_aroma: number;
          sens_acidez: number;
          sens_dulzor: number;
          sens_amargo: number;
          sens_limpieza: number;
          sens_cuerpo: number;
          sens_cuerpo_inconsistente?: number;
          sens_cuerpo_sedoso?: number;
          promedio_sensorial: number;
          // Totales
          total_ponderado: number;
          total_simple: number | null;
          comentarios: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          pareja_id?: string | null;
          pareja_nombre: string;
          evaluador: string;
          metodo: string;
          // Presentación
          pres_saludo: number;
          pres_bienvenida: number;
          pres_voz: number;
          pres_expectativa: number;
          promedio_presentacion: number;
          // Técnicos
          tec_limpieza: number;
          tec_purga: number;
          tec_pesaje: number;
          tec_ratio: number;
          tec_tiempos_agua: number;
          tec_vertido: number;
          tec_descripcion: number;
          tec_precalentamiento: number;
          tec_tiempo_prep: number;
          promedio_tecnicos: number;
          // Sensorial
          sens_aroma: number;
          sens_acidez: number;
          sens_dulzor: number;
          sens_amargo: number;
          sens_limpieza: number;
          sens_cuerpo: number;
          sens_cuerpo_inconsistente?: number;
          sens_cuerpo_sedoso?: number;
          promedio_sensorial: number;
          // Totales
          total_ponderado: number;
          total_simple?: number | null;
          comentarios?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          pareja_id?: string | null;
          pareja_nombre?: string;
          evaluador?: string;
          metodo?: string;
          pres_saludo?: number;
          pres_bienvenida?: number;
          pres_voz?: number;
          pres_expectativa?: number;
          promedio_presentacion?: number;
          tec_limpieza?: number;
          tec_purga?: number;
          tec_pesaje?: number;
          tec_ratio?: number;
          tec_tiempos_agua?: number;
          tec_vertido?: number;
          tec_descripcion?: number;
          tec_precalentamiento?: number;
          tec_tiempo_prep?: number;
          promedio_tecnicos?: number;
          sens_aroma?: number;
          sens_acidez?: number;
          sens_dulzor?: number;
          sens_amargo?: number;
          sens_limpieza?: number;
          sens_cuerpo?: number;
          sens_cuerpo_inconsistente?: number;
          sens_cuerpo_sedoso?: number;
          promedio_sensorial?: number;
          total_ponderado?: number;
          total_simple?: number | null;
          comentarios?: string | null;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluaciones_pareja_id_fkey";
            columns: ["pareja_id"];
            isOneToOne: false;
            referencedRelation: "parejas";
            referencedColumns: ["id"];
          }
        ];
      };
      configuracion: {
        Row: {
          id: number;
          mostrar_resultados: boolean;
          creado_en: string;
        };
        Insert: {
          id?: number;
          mostrar_resultados?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: number;
          mostrar_resultados?: boolean;
          creado_en?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Pareja = Database["public"]["Tables"]["parejas"]["Row"];
export type Evaluacion = Database["public"]["Tables"]["evaluaciones"]["Row"];
export type EvaluacionInsert = Database["public"]["Tables"]["evaluaciones"]["Insert"];
export type Configuracion = Database["public"]["Tables"]["configuracion"]["Row"];

export interface ParejaResumenStats {
  nombre: string;
  totalEvaluaciones: number;
  promedioPresentacion: number;
  promedioTecnicos: number;
  promedioSensorial: number;
  promedioTotalPonderado: number;
  promedioTotalSimple: number;
  metodosUtilizados: string[];
  evaluadores: string[];
}
