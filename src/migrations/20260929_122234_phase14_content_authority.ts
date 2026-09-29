import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_schematic" AS ENUM('network', 'vision', 'kinematic', 'modules', 'device', 'browser', 'pipeline', 'agents', 'events', 'tenancy');
  CREATE TYPE "public"."enum_projects_provenance" AS ENUM('verified', 'concept', 'experimental');
  CREATE TYPE "public"."enum_projects_tier" AS ENUM('flagship', 'strong', 'supporting');
  CREATE TYPE "public"."enum__projects_v_version_schematic" AS ENUM('network', 'vision', 'kinematic', 'modules', 'device', 'browser', 'pipeline', 'agents', 'events', 'tenancy');
  CREATE TYPE "public"."enum__projects_v_version_provenance" AS ENUM('verified', 'concept', 'experimental');
  CREATE TYPE "public"."enum__projects_v_version_tier" AS ENUM('flagship', 'strong', 'supporting');
  CREATE TYPE "public"."enum_skills_provenance" AS ENUM('verified', 'exploration');
  CREATE TYPE "public"."enum__skills_v_version_provenance" AS ENUM('verified', 'exploration');
  ALTER TYPE "public"."enum_skills_category" ADD VALUE 'architecture' BEFORE 'programming';
  ALTER TYPE "public"."enum_skills_category" ADD VALUE 'security' BEFORE 'tools';
  ALTER TYPE "public"."enum_skills_category" ADD VALUE 'practice' BEFORE 'tools';
  ALTER TYPE "public"."enum__skills_v_version_category" ADD VALUE 'architecture' BEFORE 'programming';
  ALTER TYPE "public"."enum__skills_v_version_category" ADD VALUE 'security' BEFORE 'tools';
  ALTER TYPE "public"."enum__skills_v_version_category" ADD VALUE 'practice' BEFORE 'tools';
  CREATE TABLE "profile_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "_profile_v_version_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "projects" ADD COLUMN "schematic" "enum_projects_schematic";
  ALTER TABLE "projects" ADD COLUMN "provenance" "enum_projects_provenance" DEFAULT 'verified';
  ALTER TABLE "projects" ADD COLUMN "tier" "enum_projects_tier" DEFAULT 'supporting';
  ALTER TABLE "projects_locales" ADD COLUMN "constraints" jsonb;
  ALTER TABLE "projects_locales" ADD COLUMN "intelligence" jsonb;
  ALTER TABLE "projects_locales" ADD COLUMN "decisions" jsonb;
  ALTER TABLE "projects_locales" ADD COLUMN "challenges" jsonb;
  ALTER TABLE "_projects_v" ADD COLUMN "version_schematic" "enum__projects_v_version_schematic";
  ALTER TABLE "_projects_v" ADD COLUMN "version_provenance" "enum__projects_v_version_provenance" DEFAULT 'verified';
  ALTER TABLE "_projects_v" ADD COLUMN "version_tier" "enum__projects_v_version_tier" DEFAULT 'supporting';
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_constraints" jsonb;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_intelligence" jsonb;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_decisions" jsonb;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_challenges" jsonb;
  ALTER TABLE "skills" ADD COLUMN "provenance" "enum_skills_provenance" DEFAULT 'verified';
  ALTER TABLE "_skills_v" ADD COLUMN "version_provenance" "enum__skills_v_version_provenance" DEFAULT 'verified';
  ALTER TABLE "profile_principles" ADD CONSTRAINT "profile_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_v_version_principles" ADD CONSTRAINT "_profile_v_version_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_profile_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "profile_principles_order_idx" ON "profile_principles" USING btree ("_order");
  CREATE INDEX "profile_principles_parent_id_idx" ON "profile_principles" USING btree ("_parent_id");
  CREATE INDEX "profile_principles_locale_idx" ON "profile_principles" USING btree ("_locale");
  CREATE INDEX "_profile_v_version_principles_order_idx" ON "_profile_v_version_principles" USING btree ("_order");
  CREATE INDEX "_profile_v_version_principles_parent_id_idx" ON "_profile_v_version_principles" USING btree ("_parent_id");
  CREATE INDEX "_profile_v_version_principles_locale_idx" ON "_profile_v_version_principles" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "profile_principles" CASCADE;
  DROP TABLE "_profile_v_version_principles" CASCADE;
  ALTER TABLE "skills" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_skills_category";
  CREATE TYPE "public"."enum_skills_category" AS ENUM('ai-ml', 'programming', 'backend', 'frontend', 'mobile', 'devops-infrastructure', 'databases', 'tools', 'other');
  ALTER TABLE "skills" ALTER COLUMN "category" SET DATA TYPE "public"."enum_skills_category" USING "category"::"public"."enum_skills_category";
  ALTER TABLE "_skills_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  DROP TYPE "public"."enum__skills_v_version_category";
  CREATE TYPE "public"."enum__skills_v_version_category" AS ENUM('ai-ml', 'programming', 'backend', 'frontend', 'mobile', 'devops-infrastructure', 'databases', 'tools', 'other');
  ALTER TABLE "_skills_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__skills_v_version_category" USING "version_category"::"public"."enum__skills_v_version_category";
  ALTER TABLE "projects" DROP COLUMN "schematic";
  ALTER TABLE "projects" DROP COLUMN "provenance";
  ALTER TABLE "projects" DROP COLUMN "tier";
  ALTER TABLE "projects_locales" DROP COLUMN "constraints";
  ALTER TABLE "projects_locales" DROP COLUMN "intelligence";
  ALTER TABLE "projects_locales" DROP COLUMN "decisions";
  ALTER TABLE "projects_locales" DROP COLUMN "challenges";
  ALTER TABLE "_projects_v" DROP COLUMN "version_schematic";
  ALTER TABLE "_projects_v" DROP COLUMN "version_provenance";
  ALTER TABLE "_projects_v" DROP COLUMN "version_tier";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_constraints";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_intelligence";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_decisions";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_challenges";
  ALTER TABLE "skills" DROP COLUMN "provenance";
  ALTER TABLE "_skills_v" DROP COLUMN "version_provenance";
  DROP TYPE "public"."enum_projects_schematic";
  DROP TYPE "public"."enum_projects_provenance";
  DROP TYPE "public"."enum_projects_tier";
  DROP TYPE "public"."enum__projects_v_version_schematic";
  DROP TYPE "public"."enum__projects_v_version_provenance";
  DROP TYPE "public"."enum__projects_v_version_tier";
  DROP TYPE "public"."enum_skills_provenance";
  DROP TYPE "public"."enum__skills_v_version_provenance";`)
}
