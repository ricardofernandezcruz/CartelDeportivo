import type { Metadata } from "next";
import { OpinionsSection } from "@/components/site/opinions-section";
import { COLUMNISTS } from "@/lib/columnists";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Vista previa de opiniones",
};

export default function PreviewOpinionesPage() {
  return (
    <OpinionsSection
      items={COLUMNISTS.map((c, i) => ({
        ...c,
        latestArticle:
          i < 2
            ? {
                slug: i === 0 ? "aguilas-ganan-cibao" : "titulo-largo",
                title:
                  i === 0
                    ? "Águilas ganan y se acercan al liderato"
                    : "Un título de columna realmente muy largo para comprobar que los puntos suspensivos no estiran ni deforman la tarjeta",
              }
            : null,
      }))}
    />
  );
}
