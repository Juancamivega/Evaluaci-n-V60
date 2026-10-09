-- ============================================================
-- SCHEMA: Evaluación V60 — Ficha de Cata Rápida
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. TABLA: parejas
-- Almacena las parejas participantes en la competencia
CREATE TABLE IF NOT EXISTS parejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_pareja TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABLA: tokens_voto
-- Tokens únicos entregados a cada juez/evaluador
CREATE TABLE IF NOT EXISTS tokens_voto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  usado BOOLEAN NOT NULL DEFAULT false,
  nombre_evaluador TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA: evaluaciones
-- Registros de cada evaluación realizada
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES tokens_voto(id) ON DELETE CASCADE,
  pareja_id UUID NOT NULL REFERENCES parejas(id) ON DELETE CASCADE,
  evaluador_nombre TEXT NOT NULL,
  aroma_pts INT NOT NULL CHECK (aroma_pts BETWEEN 1 AND 5),
  balance_pts INT NOT NULL CHECK (balance_pts BETWEEN 1 AND 5),
  cuerpo_pts INT NOT NULL CHECK (cuerpo_pts BETWEEN 1 AND 5),
  puntaje_total INT GENERATED ALWAYS AS (aroma_pts + balance_pts + cuerpo_pts) STORED,
  comentarios TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE parejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_voto ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- PAREJAS: Lectura pública, escritura pública (MVP sin auth)
CREATE POLICY "Permitir lectura pública de parejas"
  ON parejas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción pública de parejas"
  ON parejas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de parejas"
  ON parejas FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación pública de parejas"
  ON parejas FOR DELETE
  TO anon, authenticated
  USING (true);

-- TOKENS_VOTO: Lectura y actualización pública
CREATE POLICY "Permitir lectura pública de tokens"
  ON tokens_voto FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción pública de tokens"
  ON tokens_voto FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de tokens"
  ON tokens_voto FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación pública de tokens"
  ON tokens_voto FOR DELETE
  TO anon, authenticated
  USING (true);

-- EVALUACIONES: Lectura e inserción pública
CREATE POLICY "Permitir lectura pública de evaluaciones"
  ON evaluaciones FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción pública de evaluaciones"
  ON evaluaciones FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- REALTIME: Publicar tabla evaluaciones para suscripciones
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE evaluaciones;

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_evaluaciones_pareja_id ON evaluaciones(pareja_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_token_id ON evaluaciones(token_id);
CREATE INDEX IF NOT EXISTS idx_tokens_voto_token ON tokens_voto(token);

-- ============================================================
-- DATOS INICIALES (Opcional — Descomentar si se desea)
-- ============================================================
-- INSERT INTO parejas (nombre_pareja) VALUES
--   ('Pareja 1'),
--   ('Pareja 2'),
--   ('Pareja 3'),
--   ('Pareja 4'),
--   ('Pareja 5');
