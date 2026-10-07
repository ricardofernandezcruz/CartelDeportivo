import { OpinionsSection } from "@/components/site/opinions-section";
import { COLUMNISTS } from "@/lib/columnists";

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
