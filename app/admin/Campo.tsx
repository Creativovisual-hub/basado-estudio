export default function Campo({
  nombre,
  etiqueta,
  tipo = "text",
  auto,
  pista,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  auto?: string;
  pista?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-meta opacity-55">{etiqueta}</span>
      <input
        name={nombre}
        type={tipo}
        required
        autoComplete={auto}
        className="border border-line bg-transparent px-4 py-3 text-[1rem] outline-none focus:border-fg"
      />
      {pista && <span className="t-meta leading-relaxed opacity-40">{pista}</span>}
    </label>
  );
}
