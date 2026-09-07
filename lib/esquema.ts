/* ---------------------------------------------------------------------------
   Estructura de la base de datos.

   Va en TypeScript y no en un archivo .sql suelto por un motivo práctico: la
   instalación se ejecuta desde la propia web, y así no hay dos versiones del
   esquema que puedan separarse con el tiempo. Es una lista de instrucciones
   porque la conexión envía una por llamada.

   PostgreSQL estándar, sin nada exclusivo de ningún proveedor: esto se
   exporta con pg_dump y se importa en cualquier otro Postgres.

   Todas las instrucciones son "si no existe": volver a ejecutarlas no
   destruye ni duplica nada.
--------------------------------------------------------------------------- */

export const ESQUEMA: string[] = [
  // Identificadores únicos generados por la propia base.
  `create extension if not exists "pgcrypto"`,

  // Ajustes internos del sitio (por ejemplo, el secreto de firma de sesión).
  `create table if not exists ajustes (
     clave text primary key,
     valor text not null
   )`,

  /*
   * Quién puede entrar al panel.
   *
   * La contraseña se guarda como huella scrypt con sal, nunca en claro: si
   * alguien llegara a leer esta tabla, no podría entrar ni deducir la clave.
   */
  `create table if not exists usuarios (
     id            uuid primary key default gen_random_uuid(),
     usuario       text not null unique,
     clave_huella  text not null,
     creado_en     timestamptz not null default now(),
     ultimo_acceso timestamptz
   )`,

  /*
   * Proyectos.
   *
   * Los textos van duplicados en español e inglés porque la web es bilingüe
   * y cada idioma tiene su propia página indexada; no se traduce al vuelo.
   *
   * "publicado" permite dejar un proyecto a medias sin que salga en la web.
   * "orden" decide el lugar en la portada: menor número, más arriba.
   */
  `create table if not exists proyectos (
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
   )`,

  `create index if not exists proyectos_orden_idx on proyectos (publicado, orden)`,

  /*
   * Imágenes de cada proyecto.
   *
   * Se guardan dos direcciones y no una: "url" es la pública de hoy, la que
   * ve el navegador; "ruta" es el nombre dentro del almacén, que sobrevive a
   * un cambio de proveedor. Guardar sólo la url dejaría las imágenes atadas
   * para siempre a un dominio ajeno, que es el problema que tenemos hoy con
   * Adobe.
   *
   * El ancho y el alto se guardan al subir: sin ellos el navegador no sabe
   * cuánto espacio reservar y la página salta mientras cargan las fotos.
   */
  `create table if not exists imagenes (
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
   )`,

  `create index if not exists imagenes_proyecto_idx on imagenes (proyecto_id, orden)`,

  // Una sola portada por proyecto, garantizado por la base y no por la
  // aplicación: así no puede quedar inconsistente pase lo que pase.
  `create unique index if not exists imagenes_una_portada_idx
     on imagenes (proyecto_id) where portada`,
];
