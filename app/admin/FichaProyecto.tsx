"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { guardar } from "./proyectos";
import type { ProyectoFila } from "@/lib/proyectos-db";

/* ---------------------------------------------------------------------------
   Formulario de un proyecto.

   Los campos van emparejados español / inglés a la vista, para que se note
   enseguida si falta una traducción: la web tiene dos versiones indexadas y
   un campo vacío en inglés es una página coja, no un detalle.
--------------------------------------------------------------------------- */

function Texto({
  nombre,
  etiqueta,
  valor,
  pista,
  ancho,
}: {
  nombre: string;
  etiqueta: string;
  valor?: string | number | null;
  pista?: string;
  ancho?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${ancho ? "md:col-span-2" : ""}`}>
      <span className="t-meta opacity-55">{etiqueta}</span>
      <input
        name={nombre}
        defaultValue={valor ?? ""}
        className="a-campo"
      />
      {pista && <span className="t-meta leading-relaxed opacity-40">{pista}</span>}
    </label>
  );
}

function Area({
  nombre,
  etiqueta,
  valor,
  pista,
  filas = 4,
}: {
  nombre: string;
  etiqueta: string;
  valor?: string;
  pista?: string;
  filas?: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-meta opacity-55">{etiqueta}</span>
      <textarea
        name={nombre}
        rows={filas}
        defaultValue={valor ?? ""}
        className="a-campo"
      />
      {pista && <span className="t-meta leading-relaxed opacity-40">{pista}</span>}
    </label>
  );
}

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="t-meta a-boton"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export default function FichaProyecto({ p }: { p: ProyectoFila }) {
  const [estado, ejecutar] = useActionState<string | null, FormData>(
    async (previo, datos) => (await guardar(p.id, previo, datos)) ?? "guardado",
    null
  );

  return (
    <form action={ejecutar} className="flex flex-col gap-12">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Texto nombre="nombre" etiqueta="Nombre del proyecto" valor={p.nombre} />
        <Texto
          nombre="slug"
          etiqueta="Dirección web"
          valor={p.slug}
          pista="Lo que va después de /work/. Si lo dejas vacío se calcula del nombre."
        />
        <Texto nombre="cliente" etiqueta="Cliente" valor={p.cliente} />
        <Texto
          nombre="anio"
          etiqueta="Año"
          valor={p.anio}
          pista="Opcional. Si lo dejas vacío, el campo no aparece en la web."
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="t-meta opacity-55">Formato de las láminas</span>
          <select
            name="formato"
            defaultValue={p.formato || "16:9"}
            className="a-campo"
          >
            <option value="16:9">16:9 — apaisado, como Latin Wok</option>
            <option value="3:2">3:2 — apaisado, algo más alto</option>
            <option value="4:3">4:3 — clásico</option>
            <option value="1:1">1:1 — cuadrado</option>
            <option value="4:5">4:5 — vertical</option>
            <option value="original">Cada imagen con su proporción</option>
          </select>
          <span className="t-meta leading-relaxed opacity-40">
            Todas las imágenes del proyecto se muestran con esta proporción,
            recortadas para llenarla. Es lo que da el ritmo de láminas
            apiladas. Si eliges &laquo;cada imagen con su proporción&raquo;,
            se respetan tal cual y el resultado es más irregular.
          </span>
        </label>

        <Texto nombre="categoria_es" etiqueta="Categoría (español)" valor={p.categoria_es} />
        <Texto nombre="categoria_en" etiqueta="Categoría (inglés)" valor={p.categoria_en} />
        <Texto
          nombre="servicios_es"
          etiqueta="Servicios (español)"
          valor={p.servicios_es.join(", ")}
          pista="Separados por comas."
        />
        <Texto
          nombre="servicios_en"
          etiqueta="Servicios (inglés)"
          valor={p.servicios_en.join(", ")}
          pista="Separados por comas."
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Area
          nombre="intro_es"
          etiqueta="Introducción (español)"
          valor={p.intro_es}
          pista="El párrafo que abre la ficha, antes de la primera lámina."
        />
        <Area nombre="intro_en" etiqueta="Introducción (inglés)" valor={p.intro_en} />
      </section>

      <section className="flex flex-wrap items-center gap-6 border-t border-line pt-8">
        <label className="t-meta flex items-center gap-3">
          <input
            type="checkbox"
            name="publicado"
            defaultChecked={p.publicado}
            className="h-4 w-4 accent-current"
          />
          Visible en la web
        </label>
        <Guardar />
        {estado === "guardado" && (
          <span role="status" className="t-meta opacity-55">
            Guardado.
          </span>
        )}
        {estado && estado !== "guardado" && (
          <span role="alert" className="t-meta text-[#c0392b]">
            {estado}
          </span>
        )}
      </section>
    </form>
  );
}
