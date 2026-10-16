-- ==============================================================================
-- SQL: Tablas Nativas Opcionales para Códigos de Regalo Tokkii TCG
-- Ejecutar en el SQL Editor de Supabase (https://uawyiubcubczmujetczo.supabase.co)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gift_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('pack_1', 'pack_3', 'pack_5')),
  pack_quantity INTEGER NOT NULL DEFAULT 1,
  max_total_uses INTEGER, -- NULL = ilimitado, 1 = uso único, N = límite total
  max_uses_per_user INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura desde la aplicación (con clave anónima)
CREATE POLICY "Permitir lectura publica de codigos"
  ON public.gift_codes FOR SELECT
  USING (true);

CREATE POLICY "Permitir gestion de codigos"
  ON public.gift_codes FOR ALL
  USING (true)
  WITH CHECK (true);
