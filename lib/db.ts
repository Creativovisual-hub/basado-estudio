import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/* ---------------------------------------------------------------------------
   Conexión con la base de datos.

   Se habla SQL estándar, no funciones exclusivas de ningún proveedor. Si
   algún día hay que mudarse de Neon a otro Postgres, cambia la dirección de
   conexión y nada más: ni una consulta de la aplicación tendría que tocarse.

   La conexión se crea la primera vez que se pide, no al importar el archivo.
   Importándola de golpe, cualquier build sin la variable de entorno fallaría
   —incluida la vista previa de una rama recién creada— y el error sería
   confuso: hablaría de una variable, no de que falta configurar la base.
--------------------------------------------------------------------------- */

let conexion: NeonQueryFunction<false, false> | null = null;

export function db() {
  if (conexion) return conexion;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. La base de datos se conecta desde Vercel: " +
        "Storage → basado-db → Connect to Project."
    );
  }

  conexion = neon(url);
  return conexion;
}

/** ¿Hay base de datos configurada? Para poder degradar sin romper la web. */
export const hayBaseDeDatos = () => Boolean(process.env.DATABASE_URL);
