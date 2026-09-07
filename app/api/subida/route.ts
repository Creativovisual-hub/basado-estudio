import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { usuarioDeLaSesion } from "@/lib/auth";

/* ---------------------------------------------------------------------------
   Permiso de subida.

   Las imágenes viajan del navegador al almacén directamente, sin pasar por
   el servidor. No es un capricho: una foto de portfolio pesa varios megas y
   los envíos al servidor tienen un tope de 4,5 MB en Vercel. Subiendo
   directo, el límite lo pone el almacén y no la ruta.

   Este archivo no recibe la imagen: sólo firma un permiso temporal. Antes
   comprueba que hay sesión abierta, así que un desconocido no puede pedirlo
   y llenar el almacén.
--------------------------------------------------------------------------- */

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAXIMO = 25 * 1024 * 1024; // 25 MB por archivo

export async function POST(peticion: Request): Promise<NextResponse> {
  const cuerpo = (await peticion.json()) as HandleUploadBody;

  try {
    const respuesta = await handleUpload({
      body: cuerpo,
      request: peticion,

      onBeforeGenerateToken: async () => {
        if (!(await usuarioDeLaSesion())) {
          throw new Error("Hay que entrar al panel para subir imágenes.");
        }
        return {
          allowedContentTypes: TIPOS,
          maximumSizeInBytes: MAXIMO,
          addRandomSuffix: true,
          // La dirección es única por archivo y nunca cambia de contenido,
          // así que el navegador puede guardarla un año sin miedo.
          cacheControlMaxAge: 31536000,
        };
      },

      // El almacén avisa aquí cuando termina. No guardamos nada todavía: la
      // imagen se apunta en la base desde el panel, junto a sus medidas.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(respuesta);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo subir." },
      { status: 400 }
    );
  }
}
