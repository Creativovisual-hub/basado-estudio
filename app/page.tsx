import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

/** La raíz no tiene contenido propio: manda al idioma por defecto. */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
