-- 1. Crear la tabla de almacenamiento clave-valor
CREATE TABLE IF NOT EXISTS tree_test_storage (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activar la Seguridad a Nivel de Fila (RLS)
ALTER TABLE tree_test_storage ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para lectura y escritura pública

-- Política para permitir que cualquiera lea los registros
-- (Requerido para que los participantes obtengan la configuración del árbol y el administrador lea las respuestas)
DROP POLICY IF EXISTS "Permitir lectura pública" ON tree_test_storage;
CREATE POLICY "Permitir lectura pública" ON tree_test_storage
  FOR SELECT USING (true);

-- Política para permitir que cualquiera pueda insertar nuevos registros
-- (Requerido para que los participantes guarden sus resultados de test con una clave única)
DROP POLICY IF EXISTS "Permitir inserción pública" ON tree_test_storage;
CREATE POLICY "Permitir inserción pública" ON tree_test_storage
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualizar registros existentes
-- (Requerido para que el administrador actualice el árbol de tokens y tareas)
DROP POLICY IF EXISTS "Permitir actualización pública" ON tree_test_storage;
CREATE POLICY "Permitir actualización pública" ON tree_test_storage
  FOR UPDATE USING (true);

-- Política para permitir eliminar registros
-- (Requerido para que el administrador pueda borrar resultados y reiniciar el test)
DROP POLICY IF EXISTS "Permitir eliminación pública" ON tree_test_storage;
CREATE POLICY "Permitir eliminación pública" ON tree_test_storage
  FOR DELETE USING (true);
