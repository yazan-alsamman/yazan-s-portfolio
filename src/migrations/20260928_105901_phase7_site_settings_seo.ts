import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "_site_settings_v_rels" CASCADE;
  ALTER TABLE "site_settings" ADD COLUMN "share_image_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_share_image_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_share_image_id_media_id_fk" FOREIGN KEY ("version_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_share_image_idx" ON "site_settings" USING btree ("share_image_id");
  CREATE INDEX "_site_settings_v_version_version_share_image_idx" ON "_site_settings_v" USING btree ("version_share_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_site_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_share_image_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_share_image_id_media_id_fk";
  
  DROP INDEX "site_settings_share_image_idx";
  DROP INDEX "_site_settings_v_version_version_share_image_idx";
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_projects_id_idx" ON "site_settings_rels" USING btree ("projects_id");
  CREATE INDEX "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" USING btree ("order");
  CREATE INDEX "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_rels_path_idx" ON "_site_settings_v_rels" USING btree ("path");
  CREATE INDEX "_site_settings_v_rels_projects_id_idx" ON "_site_settings_v_rels" USING btree ("projects_id");
  ALTER TABLE "site_settings" DROP COLUMN "share_image_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_share_image_id";`)
}
