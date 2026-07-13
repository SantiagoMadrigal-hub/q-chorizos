-- 02-crear-feedback.sql
-- Tabla y RPC para recibir calificaciones del modal post-pedido

CREATE TABLE IF NOT EXISTS "Feedback" (
  id BIGSERIAL PRIMARY KEY,
  calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  fuente TEXT DEFAULT 'formulario-pedido',
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_feedback_creado_en ON "Feedback" (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_fuente ON "Feedback" (fuente);

-- Función SECURITY DEFINER para que anon pueda insertar
CREATE OR REPLACE FUNCTION insertar_feedback(
  p_calificacion INTEGER,
  p_comentario TEXT DEFAULT '',
  p_fuente TEXT DEFAULT 'formulario-pedido'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_calificacion < 1 OR p_calificacion > 5 THEN
    RAISE EXCEPTION 'Calificación inválida: debe estar entre 1 y 5';
  END IF;

  INSERT INTO "Feedback" (calificacion, comentario, fuente)
  VALUES (p_calificacion, p_comentario, p_fuente);
END;
$$;

-- Permiso para rol anon (clave pública)
GRANT EXECUTE ON FUNCTION insertar_feedback TO anon;