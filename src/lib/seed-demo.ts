import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ensureMeiliIndex, syncArticleToMeili } from "@/lib/search";
import { demoImages } from "@/lib/demo-images";

const prisma = new PrismaClient();
const IMG = demoImages;

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string };

function richDoc(blocks: Block[]) {
  const content = blocks.map((b) => {
    if (b.type === "h2") {
      return {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: b.text }],
      };
    }
    if (b.type === "quote") {
      return {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: b.text }],
          },
        ],
      };
    }
    return {
      type: "paragraph",
      content: [{ type: "text", text: b.text }],
    };
  });

  const html = blocks
    .map((b) => {
      if (b.type === "h2") return `<h2>${b.text}</h2>`;
      if (b.type === "quote") return `<blockquote><p>${b.text}</p></blockquote>`;
      return `<p>${b.text}</p>`;
    })
    .join("");

  return { contentJson: { type: "doc", content }, contentHtml: html };
}

export async function seedDatabase() {
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@carteldeportivo.com",
      name: "Pappy Pérez",
      role: "ADMIN",
      passwordHash,
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: "editor@carteldeportivo.com",
      name: "Redacción Cartel",
      role: "EDITOR",
      passwordHash,
    },
  });

  const writer = await prisma.user.create({
    data: {
      email: "redactor@carteldeportivo.com",
      name: "Tuto Tavárez",
      role: "WRITER",
      passwordHash,
    },
  });

  const categories = await Promise.all(
    [
      { name: "Béisbol", slug: "beisbol", color: "#fb0c0b", sortOrder: 1 },
      { name: "Baloncesto", slug: "baloncesto", color: "#F57C00", sortOrder: 2 },
      { name: "Boxeo", slug: "boxeo", color: "#1A237E", sortOrder: 3 },
      { name: "Fútbol", slug: "futbol", color: "#2E7D32", sortOrder: 4 },
      { name: "Motor", slug: "motor", color: "#37474F", sortOrder: 5 },
    ].map((c) => prisma.category.create({ data: c })),
  );
  const cat = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const authors = await Promise.all(
    [
      {
        name: "Pappy Pérez",
        slug: "pappy-perez",
        bio: "Director del Grupo Pappy Pérez: reúne múltiples programas de TV, radio y redes sociales en la plataforma Cartel Deportivo. Es miembro y expresidente de la Asociación de Cronistas Deportivos de Santiago. También del Colegio Dominicano de Periodistas. Redactor deportivo de El Nacional en Santiago.",
        avatarUrl: "/brand/columnists/pappy-perez.png",
      },
      {
        name: "Tuto Tavárez",
        slug: "tuto-tavarez",
        bio: "Redactor deportivo de La Información y productor de TV. Expresidente de la ACDS y autor de los libros “Béisbol en voz Populi” y “Santiagueros en Grandes Ligas”. Ganador en múltiples ocasiones del premio Cronista del Año en Prensa Escrita, que otorga la Asociación de Cronistas Deportivos de Santiago.",
        avatarUrl: "/brand/columnists/tuto-tavarez.png",
      },
      {
        name: "Redacción Cartel Deportivo",
        slug: "redaccion",
        bio: "Equipo editorial de Cartel Deportivo. Lo más completo en deportes.",
        avatarUrl: "https://i.pravatar.cc/150?u=redaccion-cartel",
      },
      {
        name: "MLB.com",
        slug: "mlb-com",
        bio: "Cobertura e información de Grandes Ligas.",
        avatarUrl: "https://i.pravatar.cc/150?u=mlb-com-wire",
      },
      {
        name: "Domingo Hernández",
        slug: "domingo-hernandez",
        bio: "Editor deportivo del periódico La Información y analista experto de boxeo. Egresado de la carrera de Comunicación Social de UTESA, productor de TV y miembro de la Asociación de Cronistas Deportivos de Santiago (ACDS).",
        avatarUrl: "/brand/columnists/domingo-hernandez.png",
      },
      {
        name: "Rafael Baldayac",
        slug: "rafael-baldayac",
        bio: "Periodista, historiador deportivo y relacionista público. Miembro del CDP, de la ACDS y del staff de prensa de las Águilas Cibaeñas.",
        avatarUrl: "/brand/columnists/rafael-baldayac.png",
      },
    ].map((a) => prisma.author.create({ data: a })),
  );

  const tags = await Promise.all(
    [
      { name: "Águilas Cibaeñas", slug: "aguilas-cibaenas", type: "TEAM" as const },
      { name: "LIDOM", slug: "lidom", type: "TOPIC" as const },
      { name: "MLB", slug: "mlb", type: "TOPIC" as const },
      { name: "Cibao FC", slug: "cibao-fc", type: "TEAM" as const },
      { name: "LDF", slug: "ldf", type: "TOPIC" as const },
      { name: "Opinión", slug: "opinion", type: "TOPIC" as const },
      { name: "Licey", slug: "licey", type: "TEAM" as const },
      { name: "Copa Davis", slug: "copa-davis", type: "TOPIC" as const },
      { name: "Premier League", slug: "premier-league", type: "TOPIC" as const },
      { name: "LaLiga", slug: "laliga", type: "TOPIC" as const },
      { name: "Serie A", slug: "serie-a", type: "TOPIC" as const },
      { name: "Ligue 1", slug: "ligue-1", type: "TOPIC" as const },
    ].map((t) => prisma.tag.create({ data: t })),
  );
  const tag = Object.fromEntries(tags.map((t) => [t.slug, t]));

  const articlesData = [
    {
      title: "Águilas en fase 1: abren campamento 2026-2027 con mirada al campeonato",
      slug: "aguilas-fase-1-campamento-2026-2027",
      excerpt:
        "Gian Guzmán define los primeros pasos del proyecto aguilucho: núcleo intacto, refuerzos puntuales y un mensaje claro de competitividad desde el día uno.",
      categoryId: cat.beisbol.id,
      authorId: authors[0].id,
      featured: true,
      heroImageUrl: IMG.beisbol,
      youtubeId: "dQw4w9WgXcQ",
      viewCount: 842,
      tagIds: [tag["aguilas-cibaenas"].id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "SANTIAGO.— Las Águilas Cibaeñas encendieron oficialmente el motor de la temporada 2026-2027. En un ambiente cargado de expectativa, el general manager Gian Guzmán presentó la hoja de ruta de la fase 1 del campamento, con énfasis en continuidad, competitividad inmediata y un mercado de refuerzos quirúrgico.",
        },
        {
          type: "p",
          text: "El Cibao volvió a vestirse de amarillo y negro. Entre abrazos de jugadores veteranos y la llegada de prospectos que buscan un cupo, la gerencia cibaeña dejó claro que no improvisará: el núcleo que sostuvo la campaña anterior se mantiene, y los ajustes apuntan a áreas específicas del roster.",
        },
        { type: "h2", text: "El mensaje de Gian Guzmán" },
        {
          type: "quote",
          text: "No venimos a experimentar. Venimos a construir un equipo listo para pelear desde octubre. Vamos a reforzar sin romper lo que ya funciona.",
        },
        {
          type: "p",
          text: "Guzmán explicó que la fase 1 se concentrará en evaluación física, trabajo de pitcheo y definiciones tácticas ofensivas. En paralelo, el staff técnico revisará el mercado de importados y agencia libre con criterios de necesidad: bullpen, profundidad en el infield y un bate de poder que no desbalancee la química del clubhouse.",
        },
        {
          type: "p",
          text: "La afición aguilucha, siempre exigente, recibió la apertura del campamento como el primer capítulo de una temporada que se espera intensa. Cartel Deportivo seguirá el día a día desde el Estadio Cibao.",
        },
      ]),
    },
    {
      title: "Jonrón de Ángel Martínez lleva a Cleveland a los playoffs",
      slug: "jonron-angel-martinez-cleveland-playoffs",
      excerpt:
        "El dominicano define en extras y sella el boleto de los Guardianes a la postemporada. Una noche que Santiago celebró como propia.",
      categoryId: cat.beisbol.id,
      authorId: authors[3].id,
      featured: true,
      heroImageUrl: IMG.mlb,
      viewCount: 1204,
      tagIds: [tag.mlb.id],
      ...richDoc([
        {
          type: "p",
          text: "CLEVELAND.— Ángel Martínez no necesitaba presentación. En el inning decisivo, con el Progressive Field en vilo, el slugger dominicano conectó un jonrón que cambió el destino de la franquicia y empujó a los Guardianes hacia los playoffs de Grandes Ligas.",
        },
        {
          type: "p",
          text: "El turno llegó con la presión de un rival que no perdonaba errores. Martínez esperó su pitcheo, giró con autoridad y envió la pelota hacia la gradería izquierda. El dugout explotó; en Santiago, las redes se llenaron de orgullo.",
        },
        { type: "h2", text: "Peso dominicano en la recta final" },
        {
          type: "p",
          text: "La noche de Martínez se suma a una temporada en la que varios peloteros dominicanos han sido piezas clave en la lucha por la postemporada. Para Cleveland, el jonrón no fue solo un hit: fue el sello de una campaña construida con resiliencia y timing.",
        },
        {
          type: "quote",
          text: "Uno sueña con estos momentos desde niño. Hoy se lo dedico a mi familia y a la gente que me sigue desde la República Dominicana.",
        },
        {
          type: "p",
          text: "Los Guardianes ya miran hacia octubre. Martínez, por su parte, escribe otro capítulo en la larga historia de dominicanos que deciden series cuando más importa.",
        },
      ]),
    },
    {
      title: "Cibao FC y Salcedo FC empatan sin goles en un duelo cerrado de la Jornada 7",
      slug: "cibao-fc-salcedo-fc-empatan-jornada-7",
      excerpt:
        "Equilibrio absoluto en el mediocampo, pocas claras y un punto que ambos consideran justo en la pelea de la LDF.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: true,
      heroImageUrl: IMG.futbol,
      viewCount: 318,
      tagIds: [tag["cibao-fc"].id, tag.ldf.id],
      ...richDoc([
        {
          type: "p",
          text: "SANTIAGO.— Cibao FC y Salcedo FC no pasaron del 0-0 en un encuentro marcado por la cautela táctica y la solidez defensiva. La Jornada 7 de la LDF dejó un punto para cada lado y la sensación de que ambos equipos priorizaron no perder el ritmo en la tabla.",
        },
        {
          type: "p",
          text: "El primer tiempo fue un ajedrez en el mediocampo. Cibao intentó imponer posesión, pero Salcedo cerró líneas de pase y forzó el juego por las bandas. Las mejores oportunidades llegaron en jugadas a balón parado, sin que ninguno de los porteros fuese realmente exigido.",
        },
        { type: "h2", text: "Segunda mitad sin desequilibrio" },
        {
          type: "p",
          text: "Tras el descanso, el local buscó mayor profundidad con cambios ofensivos. Salcedo respondió con transiciones rápidas que generaron peligro esporádico. Al final, el silbatazo confirmó un empate que refleja el nivel parejo de la zona alta.",
        },
        {
          type: "p",
          text: "Cibao FC mantiene su línea de irregularidad positiva; Salcedo se aferra al punto de visitante como botín valioso. La próxima jornada promete más emoción en la pelea por el liderato.",
        },
      ]),
    },
    {
      title: "Manchester City golpea primero y se instala en la cima de la Premier League",
      slug: "manchester-city-cima-premier-league",
      excerpt:
        "Cinco victorias en cinco salidas y una defensa casi impenetrable: los de Guardiola marcan el ritmo en Inglaterra.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.premier,
      viewCount: 412,
      tagIds: [tag["premier-league"].id],
      ...richDoc([
        {
          type: "p",
          text: "MANCHESTER.— El Manchester City cerró otra jornada perfecta y sostiene el liderato de la Premier League con paso impecable. El equipo combina posesión paciente con transiciones letales, una receta que hasta ahora ningún rival ha podido descifrar.",
        },
        { type: "h2", text: "Arsenal y Liverpool no se despegan" },
        {
          type: "p",
          text: "Detrás, Arsenal mantiene la presión y Liverpool se recompone tras un arranque irregular. La zona de Champions League promete pelea hasta el final, con Brighton y Brentford metidos como invitados incómodos.",
        },
        {
          type: "p",
          text: "Para Cartel Deportivo, el dato clave está en la diferencia de goles: City convierte con una eficiencia que castiga cualquier error defensivo del rival.",
        },
      ]),
    },
    {
      title: "Barcelona arrasa en LaLiga con siete victorias y un ataque demoledor",
      slug: "barcelona-arrasa-laliga-siete-victorias",
      excerpt:
        "El conjunto azulgrana lidera España con marca perfecta, mientras Real Madrid y Atlético intentan no perderle el paso.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.laliga,
      viewCount: 537,
      tagIds: [tag.laliga.id],
      ...richDoc([
        {
          type: "p",
          text: "BARCELONA.— El Barcelona domina LaLiga con autoridad: siete partidos, siete triunfos y una diferencia de goles que ya se despega del resto. El mediocampo controla los tiempos y la delantera resuelve con una facilidad que asusta.",
        },
        { type: "h2", text: "La pelea por el segundo puesto" },
        {
          type: "p",
          text: "Atlético de Madrid, Real Betis y Real Madrid se reparten la persecución con números muy parejos. En una liga tan cerrada, cada punto perdido pesa doble.",
        },
        {
          type: "p",
          text: "El calendario inmediato trae choques directos que pueden reordenar la tabla por completo.",
        },
      ]),
    },
    {
      title: "AS Roma sorprende en la Serie A y encabeza un calcio más táctico que nunca",
      slug: "as-roma-sorprende-serie-a",
      excerpt:
        "La defensa romana apenas ha sido vulnerada y eso alcanza para liderar una Serie A apretadísima en la cima.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.seriea,
      viewCount: 286,
      tagIds: [tag["serie-a"].id],
      ...richDoc([
        {
          type: "p",
          text: "ROMA.— La AS Roma lidera la Serie A con el mejor registro defensivo del torneo. Inter y Lazio igualan en puntos, pero el desempate por diferencia de goles favorece a los romanistas en este tramo.",
        },
        { type: "h2", text: "Un torneo de márgenes mínimos" },
        {
          type: "p",
          text: "El calcio volvió a su esencia: partidos de pocos goles, mucha lectura táctica y resultados que se definen en detalles. Cagliari aparece como la sorpresa agradable de las primeras jornadas.",
        },
        {
          type: "p",
          text: "Juventus y Napoli siguen al acecho, conscientes de que la temporada es larga y el margen de error es casi nulo.",
        },
      ]),
    },
    {
      title: "Mónaco manda en la Ligue 1 y el PSG se topa con un torneo más competitivo",
      slug: "monaco-manda-ligue-1-psg-competencia",
      excerpt:
        "El conjunto del Principado aprovechó su arranque sólido para tomar la punta en Francia, con Lyon y Paris FC en la pelea.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.ligue1,
      viewCount: 231,
      tagIds: [tag["ligue-1"].id],
      ...richDoc([
        {
          type: "p",
          text: "MÓNACO.— La Ligue 1 arrancó con un guion distinto al habitual: Mónaco lidera y el Paris Saint-Germain debe remar para no quedarse atrás en una temporada con más competencia que de costumbre.",
        },
        { type: "h2", text: "Lyon revive" },
        {
          type: "p",
          text: "Lyon firma un inicio notable con la valla menos batida del campeonato, mientras Paris FC confirma que su ascenso no fue casualidad.",
        },
        {
          type: "p",
          text: "Con 18 equipos, el torneo francés ofrece menos margen: una mala racha de tres fechas puede costar la zona europea.",
        },
      ]),
    },
    {
      title: "Yankees frenan a Tampa; Milwaukee llega a 99 triunfos y aprieta los comodines",
      slug: "yankees-frenan-tampa-milwaukee-99-triunfos",
      excerpt:
        "La Americana se aprieta en la recta final: Nueva York controla el ritmo y Milwaukee se acerca a la centena de victorias.",
      categoryId: cat.beisbol.id,
      authorId: authors[3].id,
      featured: true,
      heroImageUrl: IMG.mlb2,
      viewCount: 510,
      tagIds: [tag.mlb.id, tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "Nueva York controló el ritmo ante Tampa Bay en una noche en la que el pitcheo local y la ofensiva oportuna bastaron para frenar las aspiraciones de los Rays. En paralelo, Milwaukee alcanzó 99 triunfos y mantiene viva la pelea por los comodines de la Nacional.",
        },
        {
          type: "p",
          text: "La recta final de la temporada regular suele castigar a los equipos que aflojan. Los Yankees, con su experiencia de octubre, no dieron señales de relajación. Tampa, por su parte, necesitará una reacción inmediata si quiere seguir en la conversación.",
        },
        {
          type: "quote",
          text: "Cada partido de aquí en adelante es una final. No hay margen para errores baratos.",
        },
        {
          type: "p",
          text: "Milwaukee, con su racha y profundidad de roster, se perfila como uno de los equipos más peligrosos de la postemporada. La pelea por los wild cards promete noches de drama hasta el último out.",
        },
      ]),
    },
    {
      title: "Hermanos gemelos Austin y Tyler Jones arbitran juntos por primera vez en MLB",
      slug: "hermanos-gemelos-jones-arbitran-grandes-ligas",
      excerpt:
        "Historia inédita en Baltimore: dos hermanos comparten el diamante como árbitros en el mismo partido de Grandes Ligas.",
      categoryId: cat.beisbol.id,
      authorId: authors[2].id,
      featured: true,
      heroImageUrl: IMG.stadium,
      viewCount: 276,
      tagIds: [tag.mlb.id],
      ...richDoc([
        {
          type: "p",
          text: "BALTIMORE (AP).— Tyler Jones trabajó como árbitro en el primer partido de la serie mientras Austin cubrió otra posición en el mismo encuentro. Por primera vez en la historia reciente de Grandes Ligas, los hermanos gemelos Jones compartieron campo con el uniforme azul.",
        },
        {
          type: "p",
          text: "La curiosidad se transformó en emoción cuando ambos se miraron tras el primer out. La afición del Oriole Park celebró el momento con ovación, consciente de lo inusual de la escena.",
        },
        { type: "h2", text: "Una familia detrás del plato" },
        {
          type: "p",
          text: "Los Jones crecieron soñando con el béisbol. Uno como pitcher, el otro como catcher; el destino los llevó al arbitraje profesional. Hoy, su historia recuerda que el diamante también se escribe desde la imparcialidad y la disciplina.",
        },
      ]),
    },
    {
      title: "Reconocen maestro Chencho Peña en cartelera de boxeo en Santiago",
      slug: "reconocen-maestro-chencho-pena-boxeo",
      excerpt:
        "El Torneo Vacacional rindió tributo a Inocencio “Chencho” Peña, referente del boxeo amateur dominicano y formador de campeones.",
      categoryId: cat.boxeo.id,
      authorId: authors[1].id,
      featured: false,
      heroImageUrl: IMG.boxeo,
      viewCount: 189,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "SANTIAGO.— Con un reconocimiento al exboxeador y maestro Inocencio “Chencho” Peña, continuó el Torneo Vacacional de boxeo. La velada reunió a jóvenes prospectos, entrenadores y aficionados que aplaudieron una trayectoria dedicada a la formación.",
        },
        {
          type: "p",
          text: "Peña, figura respetada en el Cibao, recibió una placa y el abrazo de la comunidad pugilística. Entre combates y ovaciones, el mensaje fue claro: el boxeo dominicano se sostiene también en los maestros que forman lejos de los reflectores.",
        },
        {
          type: "quote",
          text: "Lo más importante no es ganar un cinturón. Es formar personas que respeten el ring y la vida.",
        },
      ]),
    },
    {
      title: "Jornada 6 LDF: Delfines derrota al Atlético Vega Real por la mínima",
      slug: "jornada-6-ldf-delfines-atletico-vega-real",
      excerpt:
        "Victoria a domicilio del conjunto oriental. Un gol bastó para sumar tres puntos clave en la pelea de media tabla.",
      categoryId: cat.futbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.futbol2,
      viewCount: 142,
      tagIds: [tag.ldf.id],
      ...richDoc([
        {
          type: "p",
          text: "El conjunto de Delfines del Este venció por uno a cero al Atlético Vega Real y se llevó un triunfo trabajado en la Jornada 6 de la LDF. El gol llegó en el segundo tiempo, tras una jugada por banda y un remate preciso al segundo palo.",
        },
        {
          type: "p",
          text: "Vega Real empujó en los minutos finales, pero encontró una defensa ordenada y un portero seguro. Delfines administró el resultado con inteligencia y se lleva tres puntos que reordenan su panorama en la tabla.",
        },
      ]),
    },
    {
      title: "República Dominicana vence a Egipto y asciende al Grupo I de la Copa Davis",
      slug: "rd-vence-egipto-grupo-i-copa-davis",
      excerpt:
        "Nick Hardt aseguró el punto decisivo. El equipo nacional vuelve al Grupo I Mundial tras una serie cargada de carácter en Santiago.",
      categoryId: cat.motor.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.tennis,
      viewCount: 455,
      tagIds: [tag["copa-davis"].id],
      ...richDoc([
        {
          type: "p",
          text: "SANTIAGO.— República Dominicana completó la remontada ante Egipto y selló su ascenso al Grupo I Mundial de la Copa Davis. Nick Hardt aseguró el punto decisivo con una victoria contundente que encendió a la afición local.",
        },
        {
          type: "p",
          text: "La serie mostró el crecimiento del tenis dominicano: disciplina, apoyo de casa y jugadores que respondieron cuando el marcador apretó. Autoridades y protagonistas coincidieron en que Santiago se reafirma como gran plaza para eventos internacionales.",
        },
        {
          type: "quote",
          text: "Este triunfo es de todo el país. Jugamos con el corazón y con la responsabilidad de representar bien a la República Dominicana.",
        },
      ]),
    },
    {
      title: "Inicio de prácticas: Wilhelm Lawrence vive un estreno especial con las Águilas",
      slug: "inicio-practicas-wilhelm-lawrence-aguilas",
      excerpt:
        "El Estadio Cibao abre sus puertas y Lawrence vive su primer día oficial con el uniforme amarillo y negro.",
      categoryId: cat.beisbol.id,
      authorId: authors[1].id,
      featured: false,
      heroImageUrl: IMG.beisbol2,
      viewCount: 203,
      tagIds: [tag["aguilas-cibaenas"].id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "El inmueble del Estadio Cibao abre sus puertas este lunes para recibir la primera práctica formal. Entre los rostros nuevos, Wilhelm Lawrence vivió un estreno especial: fotografías, saludos del staff y el peso de vestir uno de los uniformes más exigentes de LIDOM.",
        },
        {
          type: "p",
          text: "Lawrence trabajó en el campo con intensidad y se mostró disponible para el rol que el cuerpo técnico le asigne. En Águilas, cada práctica cuenta; el margen de error es corto y la competencia por cupos, feroz.",
        },
      ]),
    },
    {
      title: "Correcta decisión…",
      slug: "correcta-decision-baloncesto",
      excerpt:
        "Columna: por qué el cambio de estrategia en el banquillo local era inevitable y qué implica para el resto de la temporada.",
      categoryId: cat.baloncesto.id,
      authorId: authors[1].id,
      featured: false,
      heroImageUrl: IMG.basket,
      viewCount: 221,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "Había que decidir. El equipo acumulaba derrotas evitables, el vestuario pedía otra voz y la afición, paciencia agotada. El cambio no es un capricho: es una lectura fría del momento.",
        },
        {
          type: "quote",
          text: "En el baloncesto, posponer una decisión difícil solo multiplica el costo.",
        },
        {
          type: "p",
          text: "Ahora toca sostener el rumbo. Si la nueva dirección logra disciplina defensiva y claridad ofensiva, la temporada todavía tiene margen. Si no, al menos se habrá dejado de fingir que todo estaba bien.",
        },
      ]),
    },
    {
      title: "Águilas atacaron puntos débiles sin quebrar su núcleo: el plan LIDOM 2026-27",
      slug: "aguilas-atacaron-puntos-debiles-nucleo-lidom-2026-27",
      excerpt:
        "Análisis: cómo la gerencia cibaeña refuerza áreas específicas sin romper la identidad del equipo que peleará el título.",
      categoryId: cat.beisbol.id,
      authorId: authors[0].id,
      featured: false,
      heroImageUrl: IMG.beisbol,
      viewCount: 667,
      tagIds: [tag["aguilas-cibaenas"].id, tag.lidom.id, tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "La gerencia cibaeña reforzó áreas específicas mediante la agencia libre y el mercado de importados, sin quebrar el núcleo que sostiene la identidad del club. Es un equilibrio difícil: mejorar sin desfigurar.",
        },
        { type: "h2", text: "Qué se tocó y qué se preservó" },
        {
          type: "p",
          text: "Los movimientos apuntan a profundidad en el bullpen, un bate de impacto y cobertura defensiva en el cuadro. Lo que no se tocó —y eso importa— es la espina dorsal de líderes de clubhouse y piezas que ya conocen el ritmo de octubre en LIDOM.",
        },
        {
          type: "quote",
          text: "Un campeonato no se gana cambiando todo. Se gana corrigiendo lo justo y manteniendo lo que duele perder.",
        },
        {
          type: "p",
          text: "Si el plan funciona, las Águilas llegarán a la temporada regular con margen para competir desde el primer mes. Si falla, el costo será alto: la afición no perdona improvisaciones. Por ahora, el proyecto se lee con coherencia.",
        },
      ]),
    },
    {
      title: "La madrina del Licey: presentación oficial en la Rama Femenina",
      slug: "la-madrina-del-licey",
      excerpt:
        "El Club Atlético Licey presentó a la señorita que acompañará las actividades de la Rama Femenina en la nueva temporada.",
      categoryId: cat.beisbol.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.stadium,
      viewCount: 98,
      tagIds: [tag.licey.id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "SANTO DOMINGO.— La Rama Femenina del Club Atlético Licey presentó oficialmente a la señorita que fungirá como madrina en las próximas actividades institucionales. El acto reunió a directivos, aficionados y representantes de la organización azul.",
        },
        {
          type: "p",
          text: "Más allá del protocolo, la presentación refuerza el vínculo entre el club y su comunidad. El Licey sigue apostando a una identidad que combina tradición, presencia social y el orgullo de una de las franquicias más emblemáticas del país.",
        },
      ]),
    },
    {
      title: "Santiago se reafirma como gran plaza en tenis de Copa Davis",
      slug: "santiago-gran-plaza-tenis-copa-davis",
      excerpt:
        "Tras vencer a Egipto, protagonistas y autoridades destacan la infraestructura y el ambiente de la ciudad para grandes eventos.",
      categoryId: cat.motor.id,
      authorId: authors[2].id,
      featured: false,
      heroImageUrl: IMG.tennis,
      viewCount: 221,
      tagIds: [tag["copa-davis"].id],
      ...richDoc([
        {
          type: "p",
          text: "Las reacciones de protagonistas y autoridades tras vencer a Egipto coinciden: Santiago está lista para recibir tenis de alto nivel. Nick Hardt resaltó los sacrificios del equipo y el calor de la afición que empujó en los momentos clave.",
        },
        {
          type: "p",
          text: "La ciudad cibaeña suma otro argumento a su historial como sede de eventos internacionales. Para Cartel Deportivo, el mensaje es claro: cuando hay organización y pueblo, el deporte dominicano se agranda.",
        },
      ]),
    },
    {
      title: "Lo logró…",
      slug: "lo-logro-columna-entre-cuerdas",
      excerpt:
        "Columna Entre Cuerdas: cuando el ring confirma lo que el gym ya sabía, y el resto del país se entera tarde.",
      categoryId: cat.boxeo.id,
      authorId: authors[4].id,
      featured: false,
      heroImageUrl: IMG.boxeo,
      viewCount: 188,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "En principio, pocos llegaron a pensar que esta sería una temporada de total decepción para algunos y de reivindicación para otros. El ring, como siempre, se encargó de poner las cosas en su sitio.",
        },
        {
          type: "quote",
          text: "El boxeo no perdona la duda. O entras a ganar, o sales a explicar.",
        },
        {
          type: "p",
          text: "Lo logró el que trabajó cuando nadie miraba. Esa es la única moraleja que vale en esta columna.",
        },
      ]),
    },
    {
      title: "Impresionante…",
      slug: "impresionante-entre-cuerdas",
      excerpt: "Una noche de boxeo que dejó más preguntas que medallas, y un par de nombres para seguir de cerca.",
      categoryId: cat.boxeo.id,
      authorId: authors[4].id,
      featured: false,
      heroImageUrl: IMG.boxeo,
      viewCount: 154,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "Impresionante el ritmo, impresionante la afición, impresionante también lo que aún falta por ordenar en el boxeo local. Se pelea con corazón; se organiza con oficio.",
        },
        {
          type: "p",
          text: "Entre Cuerdas no es un palco: es un recordatorio de que el espectáculo se sostiene en los gyms, no en los flashes.",
        },
      ]),
    },
    {
      title: "El maestro y el ring: la deuda que el boxeo no puede aplazar",
      slug: "el-maestro-y-el-ring-deuda-boxeo",
      excerpt: "Sin formadores no hay campeones. La columna insiste en cuidar a quienes enseñan cuando se apaga la luz.",
      categoryId: cat.boxeo.id,
      authorId: authors[4].id,
      featured: false,
      heroImageUrl: IMG.boxeo,
      viewCount: 121,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "Cada velada que reconoce a un maestro es un acto de justicia tardía. El boxeo dominicano se escribe en los barrios, con costales rotos y horarios imposibles.",
        },
        {
          type: "p",
          text: "Si la federación y los clubes no protegen esa escuela, el próximo cinturón será más anecdota que sistema.",
        },
      ]),
    },
    {
      title: "Efemérides deportivas mundial: 23 de marzo",
      slug: "efemerides-deportivas-mundial-23-marzo",
      excerpt:
        "Hechos históricos deportivos: una fecha que reúne hazañas, despedidas y coincidencias que el calendario no olvida.",
      categoryId: cat.beisbol.id,
      authorId: authors[5].id,
      featured: false,
      heroImageUrl: IMG.stadium,
      viewCount: 97,
      tagIds: [tag.opinion.id],
      ...richDoc([
        {
          type: "p",
          text: "El 23 de marzo ha sido testigo de marcas, debuts y despedidas que el deporte guarda mejor que muchos archivos oficiales. Repasarlos no es nostalgia: es brújula.",
        },
        {
          type: "p",
          text: "En esta entrega, Baldayac reconstruye el hilo de una jornada que cruza disciplinas y continentes, con el mismo rigor de siempre.",
        },
      ]),
    },
    {
      title: "Cuando Gardel creía que 20 años no eran nada",
      slug: "gardel-creia-20-anos-no-eran-nada-haime-thomas",
      excerpt:
        "Pica y se Extiende: Haime Thomas no piensa igual. El tiempo, en el deporte, cobra intereses.",
      categoryId: cat.beisbol.id,
      authorId: authors[1].id,
      featured: false,
      heroImageUrl: IMG.beisbol2,
      viewCount: 176,
      tagIds: [tag.opinion.id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "Gardel cantó que veinte años no es nada. Haime Thomas, y cualquier veterano que aún se pone el uniforme, sabe que el cuerpo lleva otra contabilidad.",
        },
        {
          type: "quote",
          text: "En LIDOM el calendario no perdona: o llegas listo en octubre, o el invierno te explica por qué.",
        },
      ]),
    },
    {
      title: "El jonrón que el archivo sí recuerda",
      slug: "el-jonron-que-el-archivo-si-recuerda",
      excerpt: "Una efeméride de Grandes Ligas que todavía discute a los dominicanos en el centro de la historia.",
      categoryId: cat.beisbol.id,
      authorId: authors[5].id,
      featured: false,
      heroImageUrl: IMG.mlb,
      viewCount: 132,
      tagIds: [tag.opinion.id, tag.mlb.id],
      ...richDoc([
        {
          type: "p",
          text: "Hay jonrones que se celebran una noche y hay jonrones que se enseñan. Esta columna vuelve a uno de esos: el que el archivo no deja en paz.",
        },
        {
          type: "p",
          text: "La memoria deportiva no es adorno. Es la prueba de que el presente, sin contexto, se infla demasiado.",
        },
      ]),
    },
    {
      title: "El día que el Cibao se quedó sin aliento",
      slug: "el-dia-que-el-cibao-se-quedo-sin-aliento",
      excerpt: "Hechos históricos: una final, un estadio y una ciudad que todavía cuenta esa noche como si fuera ayer.",
      categoryId: cat.beisbol.id,
      authorId: authors[5].id,
      featured: false,
      heroImageUrl: IMG.beisbol,
      viewCount: 164,
      tagIds: [tag.opinion.id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "Hay noches que no caben en una caja de recortes. El Cibao las guarda en la voz de los que estaban ahí, no en el marcador.",
        },
        {
          type: "p",
          text: "Volver a esa fecha no es repetir el cuento: es entender por qué esta afición exige tanto y olvida tan poco.",
        },
      ]),
    },
    {
      title: "El núcleo no se toca: lo que las Águilas sí deben cuidar",
      slug: "el-nucleo-no-se-toca-aguilas",
      excerpt: "Segunda lectura del plan cibaeño: refuerzos sí, identidad también. El equilibrio es el título.",
      categoryId: cat.beisbol.id,
      authorId: authors[0].id,
      featured: false,
      heroImageUrl: IMG.beisbol2,
      viewCount: 244,
      tagIds: [tag.opinion.id, tag["aguilas-cibaenas"].id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "Se puede firmar un importado cada semana y aun así perder el camarín. Las Águilas lo saben: el núcleo no se improvisó, se sostuvo.",
        },
        {
          type: "p",
          text: "La gerencia acertó al tocar lo justo. Ahora el cuerpo técnico tiene que traducir esa geometría a outs y a carreras.",
        },
      ]),
    },
    {
      title: "Octubre no espera a nadie en LIDOM",
      slug: "octubre-no-espera-a-nadie-lidom",
      excerpt: "Columna: los equipos que llegan tarde a su identidad pagan el invierno entero.",
      categoryId: cat.beisbol.id,
      authorId: authors[0].id,
      featured: false,
      heroImageUrl: IMG.stadium,
      viewCount: 198,
      tagIds: [tag.opinion.id, tag.lidom.id],
      ...richDoc([
        {
          type: "p",
          text: "LIDOM comprime el calendario como pocas ligas. No hay mes de rodaje elegante: hay que ganar y, al mismo tiempo, descubrir quién es el equipo.",
        },
        {
          type: "quote",
          text: "El que llega a diciembre todavía presentándose, ya se despidió.",
        },
      ]),
    },
  ];

  const publishedAt = new Date("2026-09-24T12:00:00-04:00");

  for (const [index, data] of articlesData.entries()) {
    const tagIds = "tagIds" in data && data.tagIds ? data.tagIds : [];
    const { contentJson, contentHtml, tagIds: _tags, ...rest } = data as typeof data & {
      tagIds?: string[];
    };
    await prisma.article.create({
      data: {
        ...rest,
        contentJson,
        contentHtml,
        status: "PUBLISHED",
        publishedAt: new Date(publishedAt.getTime() - index * 3600_000 * 5),
        userId: index % 2 === 0 ? editor.id : writer.id,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }

  // Un borrador para demostrar el flujo editorial
  await prisma.article.create({
    data: {
      title: "Borrador: preview del mercado de importados LIDOM",
      slug: "borrador-preview-importados-lidom",
      excerpt: "Nota en progreso sobre candidatos a importados. No publicar aún.",
      ...richDoc([
        {
          type: "p",
          text: "Este es un borrador de trabajo. La redacción está compilando nombres, reportes de scouts y posibles encajes por equipo.",
        },
      ]),
      status: "DRAFT",
      featured: false,
      heroImageUrl: IMG.beisbol,
      categoryId: cat.beisbol.id,
      authorId: authors[1].id,
      userId: writer.id,
      tags: { create: [{ tagId: tag.lidom.id }] },
    },
  });

  await prisma.author.update({
    where: { id: authors[0].id },
    data: { userId: admin.id },
  });

  await ensureMeiliIndex();
  const published = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
  });
  for (const article of published) {
    await syncArticleToMeili(article);
  }

  console.log("Seed listo:", {
    users: [admin.email, editor.email, writer.email],
    password: "demo1234",
    published: published.length,
    drafts: 1,
  });

  return {
    users: [admin.email, editor.email, writer.email],
    published: published.length,
    drafts: 1,
  };
}

export async function disconnectSeedPrisma() {
  await prisma.$disconnect();
}