import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="gutter flex min-h-[70svh] flex-col justify-center"
      style={{ paddingTop: "var(--header-h)" }}
    >
      <p className="t-meta mb-8 opacity-45">(404)</p>
      <h1 className="t-head max-w-[18ch]">Esta página no está basada en nada.</h1>
      <Link href="/" className="t-meta link-underline mt-12 inline-block self-start">
        Volver al inicio
      </Link>
    </section>
  );
}
