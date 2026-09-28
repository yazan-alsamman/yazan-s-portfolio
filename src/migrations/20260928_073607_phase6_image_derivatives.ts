import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_full_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_full_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_full_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_full_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_full_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_full_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filename" varchar;
  CREATE INDEX "media_sizes_full_sizes_full_filename_idx" ON "media" USING btree ("sizes_full_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_full_sizes_full_filename_idx";
  DROP INDEX "media_sizes_square_sizes_square_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_full_url";
  ALTER TABLE "media" DROP COLUMN "sizes_full_width";
  ALTER TABLE "media" DROP COLUMN "sizes_full_height";
  ALTER TABLE "media" DROP COLUMN "sizes_full_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_full_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_full_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_square_url";
  ALTER TABLE "media" DROP COLUMN "sizes_square_width";
  ALTER TABLE "media" DROP COLUMN "sizes_square_height";
  ALTER TABLE "media" DROP COLUMN "sizes_square_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filename";`)
}
