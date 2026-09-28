# Cartel Deportivo — Demo Next.js

Reimaginación del portal [Cartel Deportivo](https://www.carteldeportivo.com/) con **Next.js (App Router)**, sitio público con **ISR** y **panel editorial** integrado en `/admin`.

## Stack (demo actual)

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide, Framer Motion |
| Backend | PostgreSQL, Prisma, Server Actions |
| Auth | Auth.js (NextAuth) — roles `ADMIN`, `EDITOR`, `WRITER` |
| Editor | Tiptap (WYSIWYG) |
| Búsqueda | Meilisearch (opcional) + fallback PostgreSQL |
| Imágenes | URLs (Unsplash en seed); listo para Cloudinary |
| Video | ID de YouTube embebido |
| Publicidad | Slots placeholder → Google Ad Manager |
| Infra local | Docker Compose (Postgres + Meilisearch) |

## Arranque rápido (demo)

```bash
cp .env.example .env
npm install
npm run demo
```

Abre:

- **Sitio:** [http://localhost:3000](http://localhost:3000)
- **Panel:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Credenciales demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `admin@carteldeportivo.com` | `demo1234` |
| Editor | `editor@carteldeportivo.com` | `demo1234` |
| Redactor | `redactor@carteldeportivo.com` | `demo1234` |

## Qué demuestra esta versión

**Sitio público**

- Portada tipo periódico deportivo (hero, destacadas, secciones béisbol/fútbol)
- Noticia individual con SEO, video YouTube, relacionadas y contador de vistas
- Categorías y buscador
- Dark mode y tipografía editorial (Oswald + Source Sans 3)
- Espacios GAM simulados

**Panel `/admin`**

- Dashboard con métricas y actividad reciente
- Listado y edición de noticias
- Editor enfocado en redacción: titular, bajada, cuerpo Tiptap, imagen, YouTube, etiquetas
- Flujo borrador → revisión → publicación (según rol)
- Vistas de categorías, autores y etiquetas (CRUD completo = roadmap)

## Roadmap (alcance futuro explícito)

- Upload Cloudinary / UploadThing desde el panel
- CRUD completo de categorías, autores y tags
- Programación de publicaciones (`SCHEDULED`)
- Indexación Meilisearch en tiempo real al publicar
- Integración Plausible / GA4 y slots reales de GAM
- Migración de contenido histórico desde WordPress
- Deploy en Vercel con Postgres gestionado (Neon/Supabase)

## Scripts

```bash
npm run dev          # desarrollo
npm run build        # build producción
npm run db:up        # Postgres + Meilisearch
npm run db:migrate   # migraciones
npm run db:seed      # datos demo
```

## Licencia

Proyecto privado — Cartel Deportivo / demo técnica.
