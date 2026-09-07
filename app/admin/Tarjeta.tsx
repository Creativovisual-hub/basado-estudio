/* ---------------------------------------------------------------------------
   Tarjeta de resumen del tablero.

   Una cifra grande y qué significa. Sin gráficas: en un portfolio no hay
   series temporales que dibujar, y un gráfico sin datos detrás es decoración
   —justo lo que hace que un panel parezca una plantilla.
--------------------------------------------------------------------------- */

export default function Tarjeta({
  titulo,
  cifra,
  nota,
  acento,
}: {
  titulo: string;
  cifra: string | number;
  nota?: string;
  acento?: boolean;
}) {
  return (
    <div className={`a-panel p-5 md:p-6 ${acento ? "a-destacada" : ""}`}>
      <p className="t-meta mb-4 opacity-45">{titulo}</p>
      <p className="a-cifra">{cifra}</p>
      {nota && <p className="a-nota mt-3" style={{ fontSize: "0.8rem" }}>{nota}</p>}
    </div>
  );
}
