-- =============================================
-- Feedback de clientes
-- =============================================

CREATE TABLE IF NOT EXISTS "Feedback" (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT NOT NULL DEFAULT '',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  fuente TEXT NOT NULL DEFAULT 'formulario-pedido'
);

-- Permitir inserts anónimos
CREATE POLICY "Permitir insert anónimo en Feedback" ON "Feedback"
FOR INSERT
TO anon
WITH CHECK (true);

-- Función para insertar feedback
CREATE OR REPLACE FUNCTION insertar_feedback(
  p_calificacion INTEGER,
  p_comentario TEXT DEFAULT '',
  p_fuente TEXT DEFAULT 'formulario-pedido'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_calificacion IS NULL OR p_calificacion < 1 OR p_calificacion > 5 THEN
    RAISE EXCEPTION 'Calificación inválida. Debe ser entre 1 y 5.';
  END IF;

  INSERT INTO "Feedback" (calificacion, comentario, fuente)
  VALUES (p_calificacion, trim(p_comentario), p_fuente);
END;
$$;

GRANT EXECUTE ON FUNCTION insertar_feedback TO anon;
