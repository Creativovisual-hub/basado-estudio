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
      <span className="a-etiqueta opacity-55">{etiqueta}</span>
      <input name={nombre} type={tipo} required autoComplete={auto} className="a-campo" />
      {pista && <span className="a-nota">{pista}</span>}
    </label>
  );
}
