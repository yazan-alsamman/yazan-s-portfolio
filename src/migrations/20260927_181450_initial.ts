import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_projects_links_kind" AS ENUM('repository', 'demo', 'article', 'other');
  CREATE TYPE "public"."enum_projects_category" AS ENUM('artificial-intelligence', 'machine-learning', 'computer-vision', 'robotics', 'software-engineering', 'web', 'mobile', 'data', 'other');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__projects_v_version_links_kind" AS ENUM('repository', 'demo', 'article', 'other');
  CREATE TYPE "public"."enum__projects_v_version_category" AS ENUM('artificial-intelligence', 'machine-learning', 'computer-vision', 'robotics', 'software-engineering', 'web', 'mobile', 'data', 'other');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__projects_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_experience_links_kind" AS ENUM('repository', 'demo', 'article', 'other');
  CREATE TYPE "public"."enum_experience_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_experience_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__experience_v_version_links_kind" AS ENUM('repository', 'demo', 'article', 'other');
  CREATE TYPE "public"."enum__experience_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experience_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__experience_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_education_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_education_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__education_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__education_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__education_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_certificates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_certificates_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__certificates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__certificates_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__certificates_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_skills_category" AS ENUM('ai-ml', 'programming', 'backend', 'frontend', 'mobile', 'devops-infrastructure', 'databases', 'tools', 'other');
  CREATE TYPE "public"."enum_skills_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_skills_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__skills_v_version_category" AS ENUM('ai-ml', 'programming', 'backend', 'frontend', 'mobile', 'devops-infrastructure', 'databases', 'tools', 'other');
  CREATE TYPE "public"."enum__skills_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__skills_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__skills_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('308', '307');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin');
  CREATE TYPE "public"."enum_profile_social_links_network" AS ENUM('github', 'linkedin', 'other');
  CREATE TYPE "public"."enum_profile_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_profile_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__profile_v_version_social_links_network" AS ENUM('github', 'linkedin', 'other');
  CREATE TYPE "public"."enum__profile_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__profile_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__profile_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__site_settings_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_cv_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_cv_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__cv_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cv_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum__cv_v_version_translation_status" AS ENUM('draft', 'in_review', 'approved');
  CREATE TABLE "projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"kind" "enum_projects_links_kind" DEFAULT 'other'
  );
  
  CREATE TABLE "projects_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"category" "enum_projects_category",
  	"timeline_start" timestamp(3) with time zone,
  	"timeline_end" timestamp(3) with time zone,
  	"experience_id" integer,
  	"cover_id" integer,
  	"video_url" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"problem" jsonb,
  	"solution" jsonb,
  	"architecture" jsonb,
  	"results" jsonb,
  	"role" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"translation_status" "enum_projects_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_projects_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"kind" "enum__projects_v_version_links_kind" DEFAULT 'other',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_category" "enum__projects_v_version_category",
  	"version_timeline_start" timestamp(3) with time zone,
  	"version_timeline_end" timestamp(3) with time zone,
  	"version_experience_id" integer,
  	"version_cover_id" integer,
  	"version_video_url" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_archived" boolean DEFAULT false,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_problem" jsonb,
  	"version_solution" jsonb,
  	"version_architecture" jsonb,
  	"version_results" jsonb,
  	"version_role" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_translation_status" "enum__projects_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "experience_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"kind" "enum_experience_links_kind" DEFAULT 'other'
  );
  
  CREATE TABLE "experience_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experience_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "experience_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"translation_status" "enum_experience_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experience_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer
  );
  
  CREATE TABLE "_experience_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"kind" "enum__experience_v_version_links_kind" DEFAULT 'other',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_experience_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_organization" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_archived" boolean DEFAULT false,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experience_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__experience_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_experience_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_translation_status" "enum__experience_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_experience_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer
  );
  
  CREATE TABLE "education" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"document_id" integer,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_education_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "education_locales" (
  	"institution" varchar,
  	"degree" varchar,
  	"field" varchar,
  	"description" jsonb,
  	"translation_status" "enum_education_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_education_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_document_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__education_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__education_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_education_v_locales" (
  	"version_institution" varchar,
  	"version_degree" varchar,
  	"version_field" varchar,
  	"version_description" jsonb,
  	"version_translation_status" "enum__education_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"issuer" varchar,
  	"issue_date" timestamp(3) with time zone,
  	"credential_id" varchar,
  	"verification_url" varchar,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_certificates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "certificates_locales" (
  	"name" varchar,
  	"description" varchar,
  	"translation_status" "enum_certificates_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "certificates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_certificates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_issuer" varchar,
  	"version_issue_date" timestamp(3) with time zone,
  	"version_credential_id" varchar,
  	"version_verification_url" varchar,
  	"version_archived" boolean DEFAULT false,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__certificates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__certificates_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_certificates_v_locales" (
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_translation_status" "enum__certificates_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_certificates_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"category" "enum_skills_category",
  	"display_order" numeric DEFAULT 100,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_skills_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "skills_locales" (
  	"label" varchar,
  	"proficiency_label" varchar,
  	"translation_status" "enum_skills_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_skills_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_category" "enum__skills_v_version_category",
  	"version_display_order" numeric DEFAULT 100,
  	"version_archived" boolean DEFAULT false,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_source_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__skills_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__skills_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_skills_v_locales" (
  	"version_label" varchar,
  	"version_proficiency_label" varchar,
  	"version_translation_status" "enum__skills_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"decorative" boolean DEFAULT false,
  	"original_filename" varchar,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"original_filename" varchar,
  	"archived" boolean DEFAULT false,
  	"archived_at" timestamp(3) with time zone,
  	"source_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '308',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection" varchar NOT NULL,
  	"document_id" varchar NOT NULL,
  	"action" varchar NOT NULL,
  	"user_email" varchar NOT NULL,
  	"locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"experience_id" integer,
  	"education_id" integer,
  	"certificates_id" integer,
  	"skills_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"redirects_id" integer,
  	"users_id" integer,
  	"audit_log_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "profile_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_profile_social_links_network",
  	"url" varchar
  );
  
  CREATE TABLE "profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portrait_id" integer,
  	"email" varchar,
  	"source_note" varchar,
  	"_status" "enum_profile_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "profile_locales" (
  	"name" varchar,
  	"title" varchar,
  	"short_bio" varchar,
  	"long_bio" jsonb,
  	"translation_status" "enum_profile_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_profile_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"network" "enum__profile_v_version_social_links_network",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_profile_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_portrait_id" integer,
  	"version_email" varchar,
  	"version_source_note" varchar,
  	"version__status" "enum__profile_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__profile_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_profile_v_locales" (
  	"version_name" varchar,
  	"version_title" varchar,
  	"version_short_bio" varchar,
  	"version_long_bio" jsonb,
  	"version_translation_status" "enum__profile_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"translation_status" "enum_site_settings_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_settings_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_translation_status" "enum__site_settings_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "cv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version" varchar,
  	"source_note" varchar,
  	"_status" "enum_cv_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cv_locales" (
  	"file_id" integer,
  	"label" varchar,
  	"download_visible" boolean DEFAULT false,
  	"translation_status" "enum_cv_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cv_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_version" varchar,
  	"version_source_note" varchar,
  	"version__status" "enum__cv_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__cv_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_cv_v_locales" (
  	"version_file_id" integer,
  	"version_label" varchar,
  	"version_download_visible" boolean DEFAULT false,
  	"version_translation_status" "enum__cv_v_version_translation_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_links_locales" ADD CONSTRAINT "projects_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links_locales" ADD CONSTRAINT "_projects_v_version_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_experience_id_experience_id_fk" FOREIGN KEY ("version_experience_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_links" ADD CONSTRAINT "experience_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_links_locales" ADD CONSTRAINT "experience_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_locales" ADD CONSTRAINT "experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_rels" ADD CONSTRAINT "experience_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_rels" ADD CONSTRAINT "experience_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_links" ADD CONSTRAINT "_experience_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_links_locales" ADD CONSTRAINT "_experience_v_version_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v_version_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_parent_id_experience_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v_locales" ADD CONSTRAINT "_experience_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_rels" ADD CONSTRAINT "_experience_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_rels" ADD CONSTRAINT "_experience_v_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "education" ADD CONSTRAINT "education_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "education_locales" ADD CONSTRAINT "education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_education_v" ADD CONSTRAINT "_education_v_parent_id_education_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."education"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_education_v" ADD CONSTRAINT "_education_v_version_document_id_documents_id_fk" FOREIGN KEY ("version_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_education_v_locales" ADD CONSTRAINT "_education_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_education_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "certificates_locales" ADD CONSTRAINT "certificates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "certificates_rels" ADD CONSTRAINT "certificates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "certificates_rels" ADD CONSTRAINT "certificates_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "certificates_rels" ADD CONSTRAINT "certificates_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_certificates_v" ADD CONSTRAINT "_certificates_v_parent_id_certificates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."certificates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_certificates_v_locales" ADD CONSTRAINT "_certificates_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_certificates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_certificates_v_rels" ADD CONSTRAINT "_certificates_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_certificates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_certificates_v_rels" ADD CONSTRAINT "_certificates_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_certificates_v_rels" ADD CONSTRAINT "_certificates_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_locales" ADD CONSTRAINT "skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_skills_v" ADD CONSTRAINT "_skills_v_parent_id_skills_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_skills_v_locales" ADD CONSTRAINT "_skills_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_skills_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_education_fk" FOREIGN KEY ("education_id") REFERENCES "public"."education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_social_links" ADD CONSTRAINT "profile_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile" ADD CONSTRAINT "profile_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile_locales" ADD CONSTRAINT "profile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_v_version_social_links" ADD CONSTRAINT "_profile_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_profile_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_profile_v" ADD CONSTRAINT "_profile_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_profile_v_locales" ADD CONSTRAINT "_profile_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_profile_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_locales" ADD CONSTRAINT "cv_locales_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cv_locales" ADD CONSTRAINT "cv_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cv_v_locales" ADD CONSTRAINT "_cv_v_locales_version_file_id_documents_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cv_v_locales" ADD CONSTRAINT "_cv_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cv_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_links_locales_locale_parent_id_unique" ON "projects_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_experience_idx" ON "projects" USING btree ("experience_id");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_archived_idx" ON "projects" USING btree ("archived");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_skills_id_idx" ON "projects_rels" USING btree ("skills_id");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_version_links_order_idx" ON "_projects_v_version_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_links_parent_id_idx" ON "_projects_v_version_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_projects_v_version_links_locales_locale_parent_id_unique" ON "_projects_v_version_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_experience_idx" ON "_projects_v" USING btree ("version_experience_id");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_version_archived_idx" ON "_projects_v" USING btree ("version_archived");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_skills_id_idx" ON "_projects_v_rels" USING btree ("skills_id");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "experience_links_order_idx" ON "experience_links" USING btree ("_order");
  CREATE INDEX "experience_links_parent_id_idx" ON "experience_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "experience_links_locales_locale_parent_id_unique" ON "experience_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experience_archived_idx" ON "experience" USING btree ("archived");
  CREATE INDEX "experience_updated_at_idx" ON "experience" USING btree ("updated_at");
  CREATE INDEX "experience_created_at_idx" ON "experience" USING btree ("created_at");
  CREATE INDEX "experience__status_idx" ON "experience" USING btree ("_status");
  CREATE UNIQUE INDEX "experience_locales_locale_parent_id_unique" ON "experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experience_rels_order_idx" ON "experience_rels" USING btree ("order");
  CREATE INDEX "experience_rels_parent_idx" ON "experience_rels" USING btree ("parent_id");
  CREATE INDEX "experience_rels_path_idx" ON "experience_rels" USING btree ("path");
  CREATE INDEX "experience_rels_skills_id_idx" ON "experience_rels" USING btree ("skills_id");
  CREATE INDEX "_experience_v_version_links_order_idx" ON "_experience_v_version_links" USING btree ("_order");
  CREATE INDEX "_experience_v_version_links_parent_id_idx" ON "_experience_v_version_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_experience_v_version_links_locales_locale_parent_id_unique" ON "_experience_v_version_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_experience_v_parent_idx" ON "_experience_v" USING btree ("parent_id");
  CREATE INDEX "_experience_v_version_version_archived_idx" ON "_experience_v" USING btree ("version_archived");
  CREATE INDEX "_experience_v_version_version_updated_at_idx" ON "_experience_v" USING btree ("version_updated_at");
  CREATE INDEX "_experience_v_version_version_created_at_idx" ON "_experience_v" USING btree ("version_created_at");
  CREATE INDEX "_experience_v_version_version__status_idx" ON "_experience_v" USING btree ("version__status");
  CREATE INDEX "_experience_v_created_at_idx" ON "_experience_v" USING btree ("created_at");
  CREATE INDEX "_experience_v_updated_at_idx" ON "_experience_v" USING btree ("updated_at");
  CREATE INDEX "_experience_v_snapshot_idx" ON "_experience_v" USING btree ("snapshot");
  CREATE INDEX "_experience_v_published_locale_idx" ON "_experience_v" USING btree ("published_locale");
  CREATE INDEX "_experience_v_latest_idx" ON "_experience_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_experience_v_locales_locale_parent_id_unique" ON "_experience_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_experience_v_rels_order_idx" ON "_experience_v_rels" USING btree ("order");
  CREATE INDEX "_experience_v_rels_parent_idx" ON "_experience_v_rels" USING btree ("parent_id");
  CREATE INDEX "_experience_v_rels_path_idx" ON "_experience_v_rels" USING btree ("path");
  CREATE INDEX "_experience_v_rels_skills_id_idx" ON "_experience_v_rels" USING btree ("skills_id");
  CREATE INDEX "education_document_idx" ON "education" USING btree ("document_id");
  CREATE INDEX "education_archived_idx" ON "education" USING btree ("archived");
  CREATE INDEX "education_updated_at_idx" ON "education" USING btree ("updated_at");
  CREATE INDEX "education_created_at_idx" ON "education" USING btree ("created_at");
  CREATE INDEX "education__status_idx" ON "education" USING btree ("_status");
  CREATE UNIQUE INDEX "education_locales_locale_parent_id_unique" ON "education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_education_v_parent_idx" ON "_education_v" USING btree ("parent_id");
  CREATE INDEX "_education_v_version_version_document_idx" ON "_education_v" USING btree ("version_document_id");
  CREATE INDEX "_education_v_version_version_archived_idx" ON "_education_v" USING btree ("version_archived");
  CREATE INDEX "_education_v_version_version_updated_at_idx" ON "_education_v" USING btree ("version_updated_at");
  CREATE INDEX "_education_v_version_version_created_at_idx" ON "_education_v" USING btree ("version_created_at");
  CREATE INDEX "_education_v_version_version__status_idx" ON "_education_v" USING btree ("version__status");
  CREATE INDEX "_education_v_created_at_idx" ON "_education_v" USING btree ("created_at");
  CREATE INDEX "_education_v_updated_at_idx" ON "_education_v" USING btree ("updated_at");
  CREATE INDEX "_education_v_snapshot_idx" ON "_education_v" USING btree ("snapshot");
  CREATE INDEX "_education_v_published_locale_idx" ON "_education_v" USING btree ("published_locale");
  CREATE INDEX "_education_v_latest_idx" ON "_education_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_education_v_locales_locale_parent_id_unique" ON "_education_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "certificates_archived_idx" ON "certificates" USING btree ("archived");
  CREATE INDEX "certificates_updated_at_idx" ON "certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "certificates" USING btree ("created_at");
  CREATE INDEX "certificates__status_idx" ON "certificates" USING btree ("_status");
  CREATE UNIQUE INDEX "certificates_locales_locale_parent_id_unique" ON "certificates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "certificates_rels_order_idx" ON "certificates_rels" USING btree ("order");
  CREATE INDEX "certificates_rels_parent_idx" ON "certificates_rels" USING btree ("parent_id");
  CREATE INDEX "certificates_rels_path_idx" ON "certificates_rels" USING btree ("path");
  CREATE INDEX "certificates_rels_media_id_idx" ON "certificates_rels" USING btree ("media_id");
  CREATE INDEX "certificates_rels_documents_id_idx" ON "certificates_rels" USING btree ("documents_id");
  CREATE INDEX "_certificates_v_parent_idx" ON "_certificates_v" USING btree ("parent_id");
  CREATE INDEX "_certificates_v_version_version_archived_idx" ON "_certificates_v" USING btree ("version_archived");
  CREATE INDEX "_certificates_v_version_version_updated_at_idx" ON "_certificates_v" USING btree ("version_updated_at");
  CREATE INDEX "_certificates_v_version_version_created_at_idx" ON "_certificates_v" USING btree ("version_created_at");
  CREATE INDEX "_certificates_v_version_version__status_idx" ON "_certificates_v" USING btree ("version__status");
  CREATE INDEX "_certificates_v_created_at_idx" ON "_certificates_v" USING btree ("created_at");
  CREATE INDEX "_certificates_v_updated_at_idx" ON "_certificates_v" USING btree ("updated_at");
  CREATE INDEX "_certificates_v_snapshot_idx" ON "_certificates_v" USING btree ("snapshot");
  CREATE INDEX "_certificates_v_published_locale_idx" ON "_certificates_v" USING btree ("published_locale");
  CREATE INDEX "_certificates_v_latest_idx" ON "_certificates_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_certificates_v_locales_locale_parent_id_unique" ON "_certificates_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_certificates_v_rels_order_idx" ON "_certificates_v_rels" USING btree ("order");
  CREATE INDEX "_certificates_v_rels_parent_idx" ON "_certificates_v_rels" USING btree ("parent_id");
  CREATE INDEX "_certificates_v_rels_path_idx" ON "_certificates_v_rels" USING btree ("path");
  CREATE INDEX "_certificates_v_rels_media_id_idx" ON "_certificates_v_rels" USING btree ("media_id");
  CREATE INDEX "_certificates_v_rels_documents_id_idx" ON "_certificates_v_rels" USING btree ("documents_id");
  CREATE INDEX "skills_archived_idx" ON "skills" USING btree ("archived");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "skills__status_idx" ON "skills" USING btree ("_status");
  CREATE UNIQUE INDEX "skills_locales_locale_parent_id_unique" ON "skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_skills_v_parent_idx" ON "_skills_v" USING btree ("parent_id");
  CREATE INDEX "_skills_v_version_version_archived_idx" ON "_skills_v" USING btree ("version_archived");
  CREATE INDEX "_skills_v_version_version_updated_at_idx" ON "_skills_v" USING btree ("version_updated_at");
  CREATE INDEX "_skills_v_version_version_created_at_idx" ON "_skills_v" USING btree ("version_created_at");
  CREATE INDEX "_skills_v_version_version__status_idx" ON "_skills_v" USING btree ("version__status");
  CREATE INDEX "_skills_v_created_at_idx" ON "_skills_v" USING btree ("created_at");
  CREATE INDEX "_skills_v_updated_at_idx" ON "_skills_v" USING btree ("updated_at");
  CREATE INDEX "_skills_v_snapshot_idx" ON "_skills_v" USING btree ("snapshot");
  CREATE INDEX "_skills_v_published_locale_idx" ON "_skills_v" USING btree ("published_locale");
  CREATE INDEX "_skills_v_latest_idx" ON "_skills_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_skills_v_locales_locale_parent_id_unique" ON "_skills_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_archived_idx" ON "media" USING btree ("archived");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "documents_archived_idx" ON "documents" USING btree ("archived");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_log_collection_idx" ON "audit_log" USING btree ("collection");
  CREATE INDEX "audit_log_document_id_idx" ON "audit_log" USING btree ("document_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_experience_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_id");
  CREATE INDEX "payload_locked_documents_rels_education_id_idx" ON "payload_locked_documents_rels" USING btree ("education_id");
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificates_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "profile_social_links_order_idx" ON "profile_social_links" USING btree ("_order");
  CREATE INDEX "profile_social_links_parent_id_idx" ON "profile_social_links" USING btree ("_parent_id");
  CREATE INDEX "profile_portrait_idx" ON "profile" USING btree ("portrait_id");
  CREATE INDEX "profile__status_idx" ON "profile" USING btree ("_status");
  CREATE UNIQUE INDEX "profile_locales_locale_parent_id_unique" ON "profile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_profile_v_version_social_links_order_idx" ON "_profile_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_profile_v_version_social_links_parent_id_idx" ON "_profile_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_profile_v_version_version_portrait_idx" ON "_profile_v" USING btree ("version_portrait_id");
  CREATE INDEX "_profile_v_version_version__status_idx" ON "_profile_v" USING btree ("version__status");
  CREATE INDEX "_profile_v_created_at_idx" ON "_profile_v" USING btree ("created_at");
  CREATE INDEX "_profile_v_updated_at_idx" ON "_profile_v" USING btree ("updated_at");
  CREATE INDEX "_profile_v_snapshot_idx" ON "_profile_v" USING btree ("snapshot");
  CREATE INDEX "_profile_v_published_locale_idx" ON "_profile_v" USING btree ("published_locale");
  CREATE INDEX "_profile_v_latest_idx" ON "_profile_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_profile_v_locales_locale_parent_id_unique" ON "_profile_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_projects_id_idx" ON "site_settings_rels" USING btree ("projects_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_snapshot_idx" ON "_site_settings_v" USING btree ("snapshot");
  CREATE INDEX "_site_settings_v_published_locale_idx" ON "_site_settings_v" USING btree ("published_locale");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" USING btree ("order");
  CREATE INDEX "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_rels_path_idx" ON "_site_settings_v_rels" USING btree ("path");
  CREATE INDEX "_site_settings_v_rels_projects_id_idx" ON "_site_settings_v_rels" USING btree ("projects_id");
  CREATE INDEX "cv__status_idx" ON "cv" USING btree ("_status");
  CREATE INDEX "cv_file_idx" ON "cv_locales" USING btree ("file_id","_locale");
  CREATE UNIQUE INDEX "cv_locales_locale_parent_id_unique" ON "cv_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cv_v_version_version__status_idx" ON "_cv_v" USING btree ("version__status");
  CREATE INDEX "_cv_v_created_at_idx" ON "_cv_v" USING btree ("created_at");
  CREATE INDEX "_cv_v_updated_at_idx" ON "_cv_v" USING btree ("updated_at");
  CREATE INDEX "_cv_v_snapshot_idx" ON "_cv_v" USING btree ("snapshot");
  CREATE INDEX "_cv_v_published_locale_idx" ON "_cv_v" USING btree ("published_locale");
  CREATE INDEX "_cv_v_latest_idx" ON "_cv_v" USING btree ("latest");
  CREATE INDEX "_cv_v_version_version_file_idx" ON "_cv_v_locales" USING btree ("version_file_id","_locale");
  CREATE UNIQUE INDEX "_cv_v_locales_locale_parent_id_unique" ON "_cv_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_links" CASCADE;
  DROP TABLE "projects_links_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_links" CASCADE;
  DROP TABLE "_projects_v_version_links_locales" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "experience_links" CASCADE;
  DROP TABLE "experience_links_locales" CASCADE;
  DROP TABLE "experience" CASCADE;
  DROP TABLE "experience_locales" CASCADE;
  DROP TABLE "experience_rels" CASCADE;
  DROP TABLE "_experience_v_version_links" CASCADE;
  DROP TABLE "_experience_v_version_links_locales" CASCADE;
  DROP TABLE "_experience_v" CASCADE;
  DROP TABLE "_experience_v_locales" CASCADE;
  DROP TABLE "_experience_v_rels" CASCADE;
  DROP TABLE "education" CASCADE;
  DROP TABLE "education_locales" CASCADE;
  DROP TABLE "_education_v" CASCADE;
  DROP TABLE "_education_v_locales" CASCADE;
  DROP TABLE "certificates" CASCADE;
  DROP TABLE "certificates_locales" CASCADE;
  DROP TABLE "certificates_rels" CASCADE;
  DROP TABLE "_certificates_v" CASCADE;
  DROP TABLE "_certificates_v_locales" CASCADE;
  DROP TABLE "_certificates_v_rels" CASCADE;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "skills_locales" CASCADE;
  DROP TABLE "_skills_v" CASCADE;
  DROP TABLE "_skills_v_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "profile_social_links" CASCADE;
  DROP TABLE "profile" CASCADE;
  DROP TABLE "profile_locales" CASCADE;
  DROP TABLE "_profile_v_version_social_links" CASCADE;
  DROP TABLE "_profile_v" CASCADE;
  DROP TABLE "_profile_v_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "_site_settings_v_rels" CASCADE;
  DROP TABLE "cv" CASCADE;
  DROP TABLE "cv_locales" CASCADE;
  DROP TABLE "_cv_v" CASCADE;
  DROP TABLE "_cv_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_links_kind";
  DROP TYPE "public"."enum_projects_category";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_projects_translation_status";
  DROP TYPE "public"."enum__projects_v_version_links_kind";
  DROP TYPE "public"."enum__projects_v_version_category";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum__projects_v_version_translation_status";
  DROP TYPE "public"."enum_experience_links_kind";
  DROP TYPE "public"."enum_experience_status";
  DROP TYPE "public"."enum_experience_translation_status";
  DROP TYPE "public"."enum__experience_v_version_links_kind";
  DROP TYPE "public"."enum__experience_v_version_status";
  DROP TYPE "public"."enum__experience_v_published_locale";
  DROP TYPE "public"."enum__experience_v_version_translation_status";
  DROP TYPE "public"."enum_education_status";
  DROP TYPE "public"."enum_education_translation_status";
  DROP TYPE "public"."enum__education_v_version_status";
  DROP TYPE "public"."enum__education_v_published_locale";
  DROP TYPE "public"."enum__education_v_version_translation_status";
  DROP TYPE "public"."enum_certificates_status";
  DROP TYPE "public"."enum_certificates_translation_status";
  DROP TYPE "public"."enum__certificates_v_version_status";
  DROP TYPE "public"."enum__certificates_v_published_locale";
  DROP TYPE "public"."enum__certificates_v_version_translation_status";
  DROP TYPE "public"."enum_skills_category";
  DROP TYPE "public"."enum_skills_status";
  DROP TYPE "public"."enum_skills_translation_status";
  DROP TYPE "public"."enum__skills_v_version_category";
  DROP TYPE "public"."enum__skills_v_version_status";
  DROP TYPE "public"."enum__skills_v_published_locale";
  DROP TYPE "public"."enum__skills_v_version_translation_status";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_profile_social_links_network";
  DROP TYPE "public"."enum_profile_status";
  DROP TYPE "public"."enum_profile_translation_status";
  DROP TYPE "public"."enum__profile_v_version_social_links_network";
  DROP TYPE "public"."enum__profile_v_version_status";
  DROP TYPE "public"."enum__profile_v_published_locale";
  DROP TYPE "public"."enum__profile_v_version_translation_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum_site_settings_translation_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum__site_settings_v_published_locale";
  DROP TYPE "public"."enum__site_settings_v_version_translation_status";
  DROP TYPE "public"."enum_cv_status";
  DROP TYPE "public"."enum_cv_translation_status";
  DROP TYPE "public"."enum__cv_v_version_status";
  DROP TYPE "public"."enum__cv_v_published_locale";
  DROP TYPE "public"."enum__cv_v_version_translation_status";`)
}
