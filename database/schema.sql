
-- Schema SIGLAD
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL -- ADMIN, TRANSPORTISTA, AGENTE, AUDITOR
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  display_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_doc') THEN
    CREATE TYPE estado_doc AS ENUM ('PENDIENTE','VALIDADA','RECHAZADA','CONFIRMADO','EN PROCESO','ANULADO');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS declaraciones (
  id SERIAL PRIMARY KEY,
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  fecha_emision DATE NOT NULL,
  pais_emisor VARCHAR(2) NOT NULL,
  tipo_operacion VARCHAR(20) NOT NULL,
  medio_transporte VARCHAR(20) NOT NULL,
  placa_vehiculo VARCHAR(10) NOT NULL,
  nombre_conductor VARCHAR(80),
  licencia_conductor VARCHAR(20),
  pais_licencia VARCHAR(2),
  aduana_salida VARCHAR(50) NOT NULL,
  aduana_entrada VARCHAR(50) NOT NULL,
  pais_destino VARCHAR(2) NOT NULL,
  km_aproximados INTEGER,
  numero_items INTEGER NOT NULL,
  valor_factura NUMERIC(12,2) NOT NULL,
  gastos_transporte NUMERIC(10,2),
  seguro NUMERIC(10,2),
  otros_gastos NUMERIC(10,2),
  valor_aduana_total NUMERIC(12,2) NOT NULL,
  moneda VARCHAR(3) NOT NULL,
  resultado_codigo VARCHAR(1),
  resultado_descripcion VARCHAR(60),
  estado_documento estado_doc NOT NULL DEFAULT 'PENDIENTE',
  firma_electronica VARCHAR(64) NOT NULL,
  raw_json JSONB NOT NULL,
  transportista_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mercancias (
  id SERIAL PRIMARY KEY,
  declaracion_id INTEGER NOT NULL REFERENCES declaraciones(id) ON DELETE CASCADE,
  linea INTEGER NOT NULL,
  descripcion VARCHAR(120) NOT NULL,
  cantidad INTEGER NOT NULL,
  unidad_medida VARCHAR(10) NOT NULL,
  valor_unitario NUMERIC(10,2) NOT NULL,
  pais_origen VARCHAR(2) NOT NULL
);

-- Bitácoras
CREATE TABLE IF NOT EXISTS bitacora_login (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(120),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_origen INET,
  operacion VARCHAR(60),
  resultado VARCHAR(20),
  numero_declaracion VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS bitacora_usuarios (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(120),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_origen INET,
  operacion VARCHAR(60),
  resultado VARCHAR(20),
  numero_declaracion VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS bitacora_registro (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(120),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_origen INET,
  operacion VARCHAR(60),
  resultado VARCHAR(20),
  numero_declaracion VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS bitacora_consultas (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(120),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_origen INET,
  operacion VARCHAR(60),
  resultado VARCHAR(20),
  numero_declaracion VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS bitacora_validacion (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(120),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_origen INET,
  operacion VARCHAR(60),
  resultado VARCHAR(20),
  numero_declaracion VARCHAR(20)
);
