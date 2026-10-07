-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "column" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "instagram" TEXT;

-- Backfill columnists so the homepage Opiniones section keeps working
UPDATE "Author" SET
  "featured" = true,
  "sortOrder" = 1,
  "column" = 'Béisbol',
  "role" = 'Director del Grupo Pappy Pérez',
  "facebook" = 'https://www.facebook.com/pappyperez',
  "twitter" = 'https://x.com/grupopappyperez',
  "tiktok" = 'https://www.tiktok.com/@pappyperez',
  "instagram" = 'https://www.instagram.com/pappyperez/'
WHERE "slug" = 'pappy-perez';

UPDATE "Author" SET
  "featured" = true,
  "sortOrder" = 2,
  "column" = 'Pica y se Extiende',
  "role" = 'Redactor deportivo y productor de TV',
  "facebook" = 'https://www.facebook.com/',
  "twitter" = 'https://x.com/grupopappyperez',
  "tiktok" = 'https://www.tiktok.com/@pappyperez',
  "instagram" = 'https://www.instagram.com/pappyperez/'
WHERE "slug" = 'tuto-tavarez';

UPDATE "Author" SET
  "featured" = true,
  "sortOrder" = 3,
  "column" = 'Entre Cuerdas',
  "role" = 'Editor deportivo',
  "facebook" = 'https://www.facebook.com/',
  "twitter" = 'https://x.com/grupopappyperez',
  "tiktok" = 'https://www.tiktok.com/@pappyperez',
  "instagram" = 'https://www.instagram.com/pappyperez/'
WHERE "slug" = 'domingo-hernandez';

UPDATE "Author" SET
  "featured" = true,
  "sortOrder" = 4,
  "column" = 'Hechos históricos deportivos',
  "role" = 'Periodista e historiador deportivo',
  "facebook" = 'https://www.facebook.com/',
  "twitter" = 'https://x.com/grupopappyperez',
  "tiktok" = 'https://www.tiktok.com/@pappyperez',
  "instagram" = 'https://www.instagram.com/pappyperez/'
WHERE "slug" = 'rafael-baldayac';
