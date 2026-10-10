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
      tokens_voto: {
        Row: {
          id: string;
          token: string;
          usado: boolean;
          nombre_evaluador: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          token?: string;
          usado?: boolean;
          nombre_evaluador?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          token?: string;
          usado?: boolean;
          nombre_evaluador?: string | null;
          creado_en?: string;
        };
        Relationships: [];
      };
      evaluaciones: {
        Row: {
          id: string;
          token_id: string;
          pareja_id: string;
          evaluador_nombre: string;
          aroma_pts: number;
          balance_pts: number;
          cuerpo_pts: number;
          puntaje_total: number;
          comentarios: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          pareja_id: string;
          evaluador_nombre: string;
          aroma_pts: number;
          balance_pts: number;
          cuerpo_pts: number;
          comentarios?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          token_id?: string;
          pareja_id?: string;
          evaluador_nombre?: string;
          aroma_pts?: number;
          balance_pts?: number;
          cuerpo_pts?: number;
          comentarios?: string | null;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluaciones_token_id_fkey";
            columns: ["token_id"];
            isOneToOne: false;
            referencedRelation: "tokens_voto";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluaciones_pareja_id_fkey";
            columns: ["pareja_id"];
            isOneToOne: false;
            referencedRelation: "parejas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Pareja = Database["public"]["Tables"]["parejas"]["Row"];
export type TokenVoto = Database["public"]["Tables"]["tokens_voto"]["Row"];
export type Evaluacion = Database["public"]["Tables"]["evaluaciones"]["Row"];
