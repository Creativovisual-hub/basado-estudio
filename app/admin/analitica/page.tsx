import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { enTexto, medirEspacio } from "@/lib/espacio";
import { site } from "@/lib/site";
import Tarjeta from "../Tarjeta";

export const dynamic = "force-dynamic";

export default async function Analitica() {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const espacio = await medirEspacio().catch(() => null);
  const porcentaje = espacio
    ? Math.min(100, Math.round((espacio.usado / espacio.limite) * 100))
    : 0;

  return (
    <main className="max-w-[62rem] p-5 md:p-8">
      <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">Analítica</h1>
      <p className="t-meta mb-7 mt-2 max-w-[62ch] leading-relaxed opacity-45">
        Cuánto espacio ocupa el portfolio y cuánto queda libre.
      </p>

      {!espacio ? (
        <div className="a-panel p-5 md:p-6">
          <p className="t-body opacity-65">
            No se pudo consultar el almacén. Vuelve a intentarlo en un momento.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tarjeta
              titulo="Espacio usado"
              cifra={enTexto(espacio.usado)}
              nota={`de ${enTexto(espacio.limite)} disponibles`}
              acento
            />
            <Tarjeta titulo="Ocupado" cifra={`${porcentaje}%`} nota="Del plan gratuito" />
            <Tarjeta
              titulo="Archivos"
              cifra={espacio.archivos}
              nota="Imágenes en tu almacén"
            />
            <Tarjeta
              titulo="Caben aún"
              cifra={espacio.caben ?? "—"}
              nota={
                espacio.mediaPorProyecto
                  ? `Proyectos más, a ${enTexto(espacio.mediaPorProyecto)} cada uno`
                  : "Sin datos todavía"
              }
            />
          </section>

          <section className="a-panel mb-6 p-5 md:p-6">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">
                Almacenamiento
              </h2>
              <p className="t-meta opacity-45">
                {enTexto(espacio.usado)} de {enTexto(espacio.limite)}
              </p>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[var(--a-suave)]">
              <div className="a-filete h-full" style={{ width: `${Math.max(porcentaje, 1)}%` }} />
            </div>

            <p className="t-meta max-w-[64ch] leading-relaxed opacity-40">
              {porcentaje < 60
                ? "Vas holgado. Cuando pases del 80% te aviso aquí, y a partir de ahí conviene decidir: comprimir las imágenes más pesadas o ampliar el plan."
                : "Te acercas al límite. Antes de ampliar el plan, mira abajo qué proyecto pesa más: casi siempre hay una o dos imágenes enormes que se pueden aligerar sin que se note."}
            </p>
          </section>

          <section className="a-panel p-5 md:p-6">
            <h2 className="mb-5 text-[1.05rem] font-semibold tracking-[-0.02em]">
              Peso por proyecto
            </h2>

            {espacio.porProyecto.length === 0 ? (
              <p className="t-body opacity-55">
                Todavía no hay imágenes en el almacén.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {espacio.porProyecto.map((p) => (
                  <li key={p.slug} className="a-fila -mx-2 px-2 py-3">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <span className="truncate text-[0.98rem] font-semibold tracking-[-0.02em]">
                        {p.nombre}
                      </span>
                      <span className="t-meta shrink-0 opacity-45">
                        {enTexto(p.bytes)} · {p.imagenes}{" "}
                        {p.imagenes === 1 ? "imagen" : "imágenes"}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-[var(--a-suave)]">
                      <div
                        className="h-full bg-[var(--a-acento)]"
                        style={{
                          width: `${Math.max(
                            2,
                            Math.round((p.bytes / espacio.porProyecto[0].bytes) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/*
            Visitas: por ahora se enlaza a Google, no se copian aquí. Traerlas
            al panel exige credenciales de servidor de Google Cloud, y eso es
            una decisión que conviene tomar sabiendo lo que cuesta montarla.
          */}
          <section className="a-panel mt-6 p-5 md:p-6">
            <h2 className="mb-3 text-[1.05rem] font-semibold tracking-[-0.02em]">
              Visitas
            </h2>
            <p className="t-body mb-4 max-w-[62ch] opacity-65">
              Quién entra, desde qué país y qué proyectos miran está en Google
              Analytics, midiendo desde el 6 de septiembre.
            </p>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noreferrer"
              className="t-meta a-boton a-boton--linea"
            >
              Abrir Google Analytics ↗
            </a>
            <p className="t-meta mt-4 max-w-[62ch] leading-relaxed opacity-40">
              Se puede traer aquí dentro —usuarios activos, países y proyectos
              más vistos— pero requiere crear una cuenta de servicio en Google
              Cloud y darle permiso de lectura sobre la propiedad{" "}
              {site.analyticsId}. Dímelo y lo montamos.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
