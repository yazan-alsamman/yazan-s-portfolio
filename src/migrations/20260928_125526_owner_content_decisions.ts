import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_profile_social_links_network" ADD VALUE 'instagram' BEFORE 'other';
  ALTER TYPE "public"."enum__profile_v_version_social_links_network" ADD VALUE 'instagram' BEFORE 'other';
  ALTER TABLE "cv_locales" ADD COLUMN "web_cv" boolean DEFAULT false;
  ALTER TABLE "_cv_v_locales" ADD COLUMN "version_web_cv" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "profile_social_links" ALTER COLUMN "network" SET DATA TYPE text;
  DROP TYPE "public"."enum_profile_social_links_network";
  CREATE TYPE "public"."enum_profile_social_links_network" AS ENUM('github', 'linkedin', 'other');
  ALTER TABLE "profile_social_links" ALTER COLUMN "network" SET DATA TYPE "public"."enum_profile_social_links_network" USING "network"::"public"."enum_profile_social_links_network";
  ALTER TABLE "_profile_v_version_social_links" ALTER COLUMN "network" SET DATA TYPE text;
  DROP TYPE "public"."enum__profile_v_version_social_links_network";
  CREATE TYPE "public"."enum__profile_v_version_social_links_network" AS ENUM('github', 'linkedin', 'other');
  ALTER TABLE "_profile_v_version_social_links" ALTER COLUMN "network" SET DATA TYPE "public"."enum__profile_v_version_social_links_network" USING "network"::"public"."enum__profile_v_version_social_links_network";
  ALTER TABLE "cv_locales" DROP COLUMN "web_cv";
  ALTER TABLE "_cv_v_locales" DROP COLUMN "version_web_cv";`)
}
