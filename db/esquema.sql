-- =========================================================================
-- BASADO ESTUDIO — estructura de la base de datos.
--
-- PostgreSQL estándar a propósito: nada exclusivo de Vercel. Si algún día
-- hay que mudarse a otro proveedor, esto se exporta con pg_dump y se importa
-- tal cual en cualquier Postgres.
--
-- Se ejecuta una sola vez, desde la consola SQL del panel de Vercel.
-- =========================================================================

-- Para generar identificadores únicos sin depender de la aplicación.
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- Quién puede entrar al panel.
--
-- La contraseña NUNCA se guarda tal cual: se guarda su huella (scrypt) junto
-- a una sal distinta por usuario. Si alguien llegara a leer esta tabla, no
-- podría iniciar sesión ni averiguar la clave.
-- -------------------------------------------------------------------------
create table if not exists usuarios (
  id            uuid primary key default gen_random_uuid(),
  usuario       text not null unique,
  clave_huella  text not null,
  creado_en     timestamptz not null default now(),
  ultimo_acceso timestamptz
);

-- -------------------------------------------------------------------------
-- Proyectos.
--
-- Los campos van duplicados en español e inglés porque la web es bilingüe y
-- cada idioma tiene su propia página indexada. Nada de traducir al vuelo.
--
-- "publicado" permite dejar un proyecto a medias sin que aparezca en la web.
-- "orden" decide el lugar en la portada: menor número, más arriba.
-- -------------------------------------------------------------------------
create table if not exists proyectos (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  orden          integer not null default 0,
  publicado      boolean not null default false,

  nombre         text not null,
  cliente        text,
  anio           integer,

  categoria_es   text not null default '',
  categoria_en   text not null default '',
  servicios_es   text[] not null default '{}',
  servicios_en   text[] not null default '{}',
  intro_es       text not null default '',
  intro_en       text not null default '',
  notas_es       text[] not null default '{}',
  notas_en       text[] not null default '{}',

  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists proyectos_orden_idx on proyectos (publicado, orden);

-- -------------------------------------------------------------------------
-- Imágenes de cada proyecto.
--
-- Se guardan dos cosas por imagen y no una: la dirección pública completa
-- (url) y la ruta interna en el almacén (ruta). La segunda es la que permite
-- cambiar de proveedor de almacenamiento sin perder el rastro de los
-- archivos: se vuelven a subir con la misma ruta y sólo cambia la dirección.
--
-- El ancho y el alto se guardan al subir. Sin ellos el navegador no sabe
-- cuánto espacio reservar y la página da saltos mientras cargan las fotos.
--
-- "portada" marca la imagen que representa al proyecto en la portada.
-- -------------------------------------------------------------------------
create table if not exists imagenes (
  id          uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos (id) on delete cascade,
  url         text not null,
  ruta        text not null,
  ancho       integer not null,
  alto        integer not null,
  orden       integer not null default 0,
  portada     boolean not null default false,
  alt_es      text not null default '',
  alt_en      text not null default '',
  creado_en   timestamptz not null default now()
);

create index if not exists imagenes_proyecto_idx on imagenes (proyecto_id, orden);

-- Una sola portada por proyecto, garantizado por la base de datos y no por
-- la aplicación: así no puede quedar inconsistente pase lo que pase.
create unique index if not exists imagenes_una_portada_idx
  on imagenes (proyecto_id) where portada;
