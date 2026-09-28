import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_education_date_precision" AS ENUM('month', 'year');
  CREATE TYPE "public"."enum__education_v_version_date_precision" AS ENUM('month', 'year');
  ALTER TABLE "education" ADD COLUMN "date_precision" "enum_education_date_precision" DEFAULT 'month';
  ALTER TABLE "_education_v" ADD COLUMN "version_date_precision" "enum__education_v_version_date_precision" DEFAULT 'month';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "education" DROP COLUMN "date_precision";
  ALTER TABLE "_education_v" DROP COLUMN "version_date_precision";
  DROP TYPE "public"."enum_education_date_precision";
  DROP TYPE "public"."enum__education_v_version_date_precision";`)
}
