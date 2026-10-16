-- ============================================================
-- SCHEMA: Evaluación de Taza — Técnico en Servicios de Barismo
-- SENA - Centro de la Industria la Empresa y los Servicios
-- ============================================================
-- Ejecutar en Supabase: Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1. TABLA: parejas
CREATE TABLE IF NOT EXISTS parejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_pareja TEXT NOT NULL UNIQUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aseguramos que nombre_pareja sea UNIQUE si ya existía sin esa restricción
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'parejas_nombre_pareja_key'
  ) THEN
    ALTER TABLE parejas ADD CONSTRAINT parejas_nombre_pareja_key UNIQUE (nombre_pareja);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 2. TABLA: evaluaciones
-- Recreamos la tabla evaluaciones para asegurar la nueva estructura con los 20 criterios
DROP TABLE IF EXISTS evaluaciones CASCADE;

CREATE TABLE evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pareja_id UUID REFERENCES parejas(id) ON DELETE SET NULL,
  pareja_nombre TEXT NOT NULL,
  evaluador TEXT NOT NULL,
  metodo TEXT NOT NULL,

  -- Categoría 1: PRESENTACIÓN (30%)
  pres_saludo INT NOT NULL CHECK (pres_saludo BETWEEN 1 AND 5),
  pres_bienvenida INT NOT NULL CHECK (pres_bienvenida BETWEEN 1 AND 5),
  pres_voz INT NOT NULL CHECK (pres_voz BETWEEN 1 AND 5),
  pres_expectativa INT NOT NULL CHECK (pres_expectativa BETWEEN 1 AND 5),
  promedio_presentacion NUMERIC(4,2) NOT NULL,

  -- Categoría 2: ASPECTOS TÉCNICOS (30%)
  tec_limpieza INT NOT NULL CHECK (tec_limpieza BETWEEN 1 AND 5),
  tec_purga INT NOT NULL CHECK (tec_purga BETWEEN 1 AND 5),
  tec_pesaje INT NOT NULL CHECK (tec_pesaje BETWEEN 1 AND 5),
  tec_ratio INT NOT NULL CHECK (tec_ratio BETWEEN 1 AND 5),
  tec_tiempos_agua INT NOT NULL CHECK (tec_tiempos_agua BETWEEN 1 AND 5),
  tec_vertido INT NOT NULL CHECK (tec_vertido BETWEEN 1 AND 5),
  tec_descripcion INT NOT NULL CHECK (tec_descripcion BETWEEN 1 AND 5),
  tec_precalentamiento INT NOT NULL CHECK (tec_precalentamiento BETWEEN 1 AND 5),
  tec_tiempo_prep INT NOT NULL CHECK (tec_tiempo_prep BETWEEN 1 AND 5),
  promedio_tecnicos NUMERIC(4,2) NOT NULL,

  -- Categoría 3: PREPARACIÓN / EVALUACIÓN SENSORIAL (40%)
  sens_aroma INT NOT NULL CHECK (sens_aroma BETWEEN 1 AND 5),
  sens_acidez INT NOT NULL CHECK (sens_acidez BETWEEN 1 AND 5),
  sens_dulzor INT NOT NULL CHECK (sens_dulzor BETWEEN 1 AND 5),
  sens_amargo INT NOT NULL CHECK (sens_amargo BETWEEN 1 AND 5),
  sens_limpieza INT NOT NULL CHECK (sens_limpieza BETWEEN 1 AND 5),
  sens_cuerpo_inconsistente INT NOT NULL CHECK (sens_cuerpo_inconsistente BETWEEN 1 AND 5),
  sens_cuerpo_sedoso INT NOT NULL CHECK (sens_cuerpo_sedoso BETWEEN 1 AND 5),
  promedio_sensorial NUMERIC(4,2) NOT NULL,

  -- TOTALES PONDERADOS Y SIMPLES
  total_ponderado NUMERIC(4,2) NOT NULL,
  total_simple NUMERIC(4,2),
  comentarios TEXT,

  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA: configuracion (Opcional para control)
CREATE TABLE IF NOT EXISTS configuracion (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mostrar_resultados BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO configuracion (id, mostrar_resultados)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Acceso público para la competencia
-- ============================================================
ALTER TABLE parejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas para parejas
DROP POLICY IF EXISTS "Permitir lectura pública de parejas" ON parejas;
CREATE POLICY "Permitir lectura pública de parejas" ON parejas FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de parejas" ON parejas;
CREATE POLICY "Permitir inserción pública de parejas" ON parejas FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de parejas" ON parejas;
CREATE POLICY "Permitir eliminación pública de parejas" ON parejas FOR DELETE TO anon, authenticated USING (true);

-- Políticas para evaluaciones
DROP POLICY IF EXISTS "Permitir lectura pública de evaluaciones" ON evaluaciones;
CREATE POLICY "Permitir lectura pública de evaluaciones" ON evaluaciones FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de evaluaciones" ON evaluaciones;
CREATE POLICY "Permitir inserción pública de evaluaciones" ON evaluaciones FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de evaluaciones" ON evaluaciones;
CREATE POLICY "Permitir eliminación pública de evaluaciones" ON evaluaciones FOR DELETE TO anon, authenticated USING (true);

-- Políticas para configuracion
DROP POLICY IF EXISTS "Permitir lectura pública de configuracion" ON configuracion;
CREATE POLICY "Permitir lectura pública de configuracion" ON configuracion FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir actualización pública de configuracion" ON configuracion;
CREATE POLICY "Permitir actualización pública de configuracion" ON configuracion FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME (Añadir solo si no están ya en la publicación)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'evaluaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE evaluaciones;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'configuracion'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE configuracion;
  END IF;
END $$;

-- ============================================================
-- PRECARGA DE LAS 13 PAREJAS OFICIALES
-- ============================================================
INSERT INTO parejas (nombre_pareja) VALUES
  ('ANGEL Y SOFIA'),
  ('J. CAMILO Y TATIANA'),
  ('MAICOL Y JERSON'),
  ('KELLY Y BARBARA'),
  ('DIANA Z Y FRITZ'),
  ('EDDY Y DIANA M'),
  ('ADRIANA Y  EMILIANO'),
  ('LAURA Y LILIANA'),
  ('ZAHIRA Y LUIS ALBERTO'),
  ('KEVIN Y RAMIRO'),
  ('LORENA Y JESSICA'),
  ('STIVEN Y KIMBERLY'),
  ('BRAYAN Y JUAN JOSÉ')
ON CONFLICT (nombre_pareja) DO NOTHING;
