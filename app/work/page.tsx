import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import ProjectGrid from "@/components/ProjectGrid";
import { RevealLines } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Proyectos de identidad visual, branding, dirección de arte y diseño web de Basado Estudio.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section
        className="gutter pb-[10vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <h1 className="t-head">
          <RevealLines lines={["Trabajo", "seleccionado."]} stagger={0.09} />
        </h1>
        <p className="t-meta mt-10 opacity-45">
          {projects.length} proyectos — Identidad visual y branding
        </p>
      </section>

      <ProjectGrid items={projects} />

      <div className="h-[var(--pad)]" />
    </>
  );
}
