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
   * Formato de las láminas del proyecto.
   *
   * En un case study las imágenes se leen mejor todas con la misma
   * proporción: es lo que da el ritmo de láminas apiladas y el scroll largo.
   * Latin Wok, por ejemplo, son diez piezas de 1920x1080 exactas.
   *
   * Se guarda por proyecto y no por imagen porque es una decisión de
   * composición, no de cada foto. "original" deja a cada una con la suya.
   *
   * Va como alteración y no dentro del create porque se añadió después de la
   * primera versión. Volver a ejecutarlo no hace nada.
   */
  `alter table proyectos add column if not exists formato text not null default '16:9'`,

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

  /*
   * Bloques de texto intercalados entre las láminas.
   *
   * Una ficha de proyecto no es sólo imágenes: la de Latin Wok, por ejemplo,
   * tiene la introducción y cuatro bloques más repartidos entre las fotos,
   * de tres párrafos cada uno. Esos respiros son parte de la composición.
   *
   * Tabla aparte y no una lista dentro del proyecto porque cada bloque
   * necesita saber DÓNDE va: "posicion" es el número de la imagen tras la
   * cual aparece. Repartirlos automáticamente, como se hacía antes, quita
   * justo la decisión que importa.
   */
  `create table if not exists textos (
     id          uuid primary key default gen_random_uuid(),
     proyecto_id uuid not null references proyectos (id) on delete cascade,
     posicion    integer not null default 1,
     orden       integer not null default 0,
     texto_es    text not null default '',
     texto_en    text not null default '',
     creado_en   timestamptz not null default now()
   )`,

  `create index if not exists textos_proyecto_idx on textos (proyecto_id, posicion, orden)`,

  // Una sola portada por proyecto, garantizado por la base y no por la
  // aplicación: así no puede quedar inconsistente pase lo que pase.
  `create unique index if not exists imagenes_una_portada_idx
     on imagenes (proyecto_id) where portada`,
];

/* ---------------------------------------------------------------------------
   Puesta al día del esquema.

   Se ejecuta una vez por arranque del servidor, no en cada visita: todas las
   instrucciones son idempotentes, pero lanzarlas continuamente sería gastar
   viajes a la base para nada.

   Sirve para que una columna añadida más tarde aparezca sola, sin que nadie
   tenga que acordarse de ejecutar nada a mano.
--------------------------------------------------------------------------- */

let puestaAlDia: Promise<void> | null = null;

export function asegurarEsquema(ejecutar: (instruccion: string) => Promise<unknown>) {
  if (!puestaAlDia) {
    puestaAlDia = (async () => {
      for (const instruccion of ESQUEMA) await ejecutar(instruccion);
    })().catch((error) => {
      // Si falla, se permite reintentar en la siguiente petición en vez de
      // dejar el proceso marcado como roto para siempre.
      puestaAlDia = null;
      throw error;
    });
  }
  return puestaAlDia;
}
