-- =============================================
-- 1. Política RLS: permite inserts anónimos
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'Pedidos'
      AND policyname = 'Permitir insert anónimo'
  ) THEN
    EXECUTE 'CREATE POLICY "Permitir insert anónimo" ON "Pedidos"
             FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END;
$$;

-- =============================================
-- 2. Función SECURITY DEFINER con validación
-- =============================================
CREATE OR REPLACE FUNCTION insertar_pedido(
  p_nombre_completo TEXT,
  p_telefono TEXT,
  p_email TEXT,
  p_direccion_entrega TEXT,
  p_instrucciones TEXT DEFAULT '',
  p_cantidad INTEGER DEFAULT 1,
  p_metodo_pago TEXT DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar nombre completo
  IF p_nombre_completo IS NULL OR length(trim(p_nombre_completo)) < 3 THEN
    RAISE EXCEPTION 'El nombre debe tener al menos 3 caracteres.';
  END IF;

  -- Validar teléfono colombiano: 10 dígitos, empieza con 3
  IF p_telefono IS NULL OR p_telefono !~ '^3\d{9}$' THEN
    RAISE EXCEPTION 'Teléfono inválido. Debe ser un número colombiano de 10 dígitos.';
  END IF;

  -- Validar email
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Correo electrónico inválido.';
  END IF;

  -- Validar dirección
  IF p_direccion_entrega IS NULL OR length(trim(p_direccion_entrega)) < 5 THEN
    RAISE EXCEPTION 'La dirección debe tener al menos 5 caracteres.';
  END IF;

  -- Validar cantidad
  IF p_cantidad IS NULL OR p_cantidad < 1 OR p_cantidad > 100 THEN
    RAISE EXCEPTION 'La cantidad debe estar entre 1 y 100.';
  END IF;

  -- Validar método de pago
  IF p_metodo_pago IS NULL OR p_metodo_pago NOT IN ('efectivo', 'transferencia', 'qr') THEN
    RAISE EXCEPTION 'Método de pago inválido.';
  END IF;

  INSERT INTO "Pedidos" (
    nombre_completo,
    telefono,
    email,
    direccion_entrega,
    instrucciones,
    cantidad,
    metodo_pago
  ) VALUES (
    trim(p_nombre_completo),
    trim(p_telefono),
    trim(p_email),
    trim(p_direccion_entrega),
    trim(p_instrucciones),
    p_cantidad,
    p_metodo_pago
  );
END;
$$;

-- =============================================
-- 3. Permiso para que anónimos ejecuten la función
-- =============================================
GRANT EXECUTE ON FUNCTION insertar_pedido TO anon;
