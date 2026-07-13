-- =============================================
-- MIGRACIÓN: Agregar columnas producto y precio_unitario a Pedidos
-- Ejecutar EN ORDEN después de 01-crear-politica-rls.sql
-- =============================================

-- 1. Agregar columnas si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Pedidos' AND column_name = 'producto'
  ) THEN
    ALTER TABLE "Pedidos" ADD COLUMN producto TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Pedidos' AND column_name = 'precio_unitario'
  ) THEN
    ALTER TABLE "Pedidos" ADD COLUMN precio_unitario INTEGER;
  END IF;
END;
$$;

-- 2. Hacer producto NOT NULL (opcional, pero recomendado para integridad)
-- Primero actualiza registros existentes si los hay
UPDATE "Pedidos" SET producto = 'Chorizo tradicional' WHERE producto IS NULL;

-- Luego añade la restricción (descomenta si quieres enforzarlo)
-- ALTER TABLE "Pedidos" ALTER COLUMN producto SET NOT NULL;

-- 3. ELIMINAR función antigua (con firma diferente) y crear la nueva
-- PostgreSQL no permite CREATE OR REPLACE si cambia la firma
DROP FUNCTION IF EXISTS insertar_pedido(
  p_nombre_completo TEXT,
  p_telefono TEXT,
  p_email TEXT,
  p_direccion_entrega TEXT,
  p_instrucciones TEXT,
  p_cantidad INTEGER,
  p_metodo_pago TEXT
);

-- 4. Crear función nueva con producto y precio
CREATE OR REPLACE FUNCTION insertar_pedido(
  p_nombre_completo TEXT,
  p_telefono TEXT,
  p_email TEXT,
  p_direccion_entrega TEXT,
  p_instrucciones TEXT DEFAULT '',
  p_cantidad INTEGER DEFAULT 1,
  p_metodo_pago TEXT DEFAULT '',
  p_producto TEXT DEFAULT 'Chorizo tradicional',
  p_precio_unitario INTEGER DEFAULT 25000
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

  -- Validar producto
  IF p_producto IS NULL OR p_producto NOT IN ('Chorizo tradicional', 'Chorizo picante', 'Chorizo premium') THEN
    RAISE EXCEPTION 'Producto inválido.';
  END IF;

  -- Validar precio coherente con producto
  IF p_precio_unitario IS NULL OR p_precio_unitario <= 0 THEN
    RAISE EXCEPTION 'Precio unitario inválido.';
  END IF;

  INSERT INTO "Pedidos" (
    nombre_completo,
    telefono,
    email,
    direccion_entrega,
    instrucciones,
    cantidad,
    metodo_pago,
    producto,
    precio_unitario
  ) VALUES (
    trim(p_nombre_completo),
    trim(p_telefono),
    trim(p_email),
    trim(p_direccion_entrega),
    trim(p_instrucciones),
    p_cantidad,
    p_metodo_pago,
    p_producto,
    p_precio_unitario
  );
END;
$$;

-- 5. Permiso para que anónimos ejecuten la función
GRANT EXECUTE ON FUNCTION insertar_pedido TO anon;