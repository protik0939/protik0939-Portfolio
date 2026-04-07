-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'PASSWORD_CHANGE');

-- AlterTable
ALTER TABLE "admin_login_otps" ADD COLUMN     "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN';

-- CreateTable
CREATE TABLE "site_configs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "singleton_key" INTEGER NOT NULL DEFAULT 1,
    "site_title_en" TEXT NOT NULL,
    "site_title_bn" TEXT NOT NULL,
    "site_description_en" TEXT NOT NULL,
    "site_description_bn" TEXT NOT NULL,
    "nav_home_en" TEXT NOT NULL DEFAULT 'Home',
    "nav_home_bn" TEXT NOT NULL DEFAULT 'হোম',
    "nav_about_en" TEXT NOT NULL DEFAULT 'About',
    "nav_about_bn" TEXT NOT NULL DEFAULT 'পরিচিতি',
    "nav_education_en" TEXT NOT NULL DEFAULT 'Education',
    "nav_education_bn" TEXT NOT NULL DEFAULT 'শিক্ষা',
    "nav_skills_en" TEXT NOT NULL DEFAULT 'Skills',
    "nav_skills_bn" TEXT NOT NULL DEFAULT 'দক্ষতা',
    "nav_projects_en" TEXT NOT NULL DEFAULT 'Projects',
    "nav_projects_bn" TEXT NOT NULL DEFAULT 'প্রজেক্ট',
    "nav_blogs_en" TEXT NOT NULL DEFAULT 'Blogs',
    "nav_blogs_bn" TEXT NOT NULL DEFAULT 'ব্লগসমূহ',
    "nav_contact_en" TEXT NOT NULL DEFAULT 'Contact',
    "nav_contact_bn" TEXT NOT NULL DEFAULT 'যোগাযোগ',
    "nav_cv_en" TEXT NOT NULL DEFAULT 'CV',
    "nav_cv_bn" TEXT NOT NULL DEFAULT 'সিভি',
    "logo_light_url" TEXT,
    "logo_dark_url" TEXT,
    "hero_hello_en" TEXT NOT NULL DEFAULT 'Hello!',
    "hero_hello_bn" TEXT NOT NULL DEFAULT 'হ্যালো!',
    "hero_iam_en" TEXT NOT NULL DEFAULT 'I am',
    "hero_iam_bn" TEXT NOT NULL DEFAULT 'আমি',
    "hero_first_name_en" TEXT NOT NULL DEFAULT 'Sadat Alam',
    "hero_first_name_bn" TEXT NOT NULL DEFAULT 'সাদাত আলম',
    "hero_last_name_en" TEXT NOT NULL DEFAULT 'Protik',
    "hero_last_name_bn" TEXT NOT NULL DEFAULT 'প্রতীক',
    "hero_description_en" TEXT NOT NULL DEFAULT '',
    "hero_description_bn" TEXT NOT NULL DEFAULT '',
    "about_description_en" TEXT NOT NULL DEFAULT '',
    "about_description_bn" TEXT NOT NULL DEFAULT '',
    "projects_section_title_en" TEXT NOT NULL DEFAULT 'Projects',
    "projects_section_title_bn" TEXT NOT NULL DEFAULT 'প্রজেক্ট',
    "blogs_section_title_en" TEXT NOT NULL DEFAULT 'Blogs',
    "blogs_section_title_bn" TEXT NOT NULL DEFAULT 'ব্লগসমূহ',
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_location_en" TEXT,
    "contact_location_bn" TEXT,
    "cv_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "degree_en" TEXT NOT NULL,
    "degree_bn" TEXT NOT NULL,
    "subject_en" TEXT NOT NULL,
    "subject_bn" TEXT NOT NULL,
    "year_label" TEXT NOT NULL,
    "result_en" TEXT NOT NULL,
    "result_bn" TEXT NOT NULL,
    "institution_en" TEXT NOT NULL,
    "institution_bn" TEXT NOT NULL,
    "details_en" TEXT NOT NULL DEFAULT '',
    "details_bn" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT,
    "logo_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "category_title_en" TEXT NOT NULL,
    "category_title_bn" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "logo_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "member_code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,
    "image_url" TEXT,
    "portfolio_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_bn" TEXT NOT NULL,
    "type_en" TEXT NOT NULL,
    "type_bn" TEXT NOT NULL,
    "details_en" TEXT NOT NULL DEFAULT '',
    "details_bn" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL,
    "category_en" TEXT NOT NULL,
    "category_bn" TEXT NOT NULL,
    "live_url" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "technologies_en" TEXT NOT NULL DEFAULT '',
    "technologies_bn" TEXT NOT NULL DEFAULT '',
    "member_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_bn" TEXT NOT NULL,
    "author_name_en" TEXT NOT NULL,
    "author_name_bn" TEXT NOT NULL,
    "time_to_read_minutes" INTEGER NOT NULL DEFAULT 5,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_details_en" TEXT NOT NULL DEFAULT '',
    "full_details_bn" TEXT NOT NULL DEFAULT '',
    "tags_en" TEXT NOT NULL DEFAULT '',
    "tags_bn" TEXT NOT NULL DEFAULT '',
    "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cover_image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_configs_singleton_key_key" ON "site_configs"("singleton_key");

-- CreateIndex
CREATE INDEX "site_configs_admin_id_idx" ON "site_configs"("admin_id");

-- CreateIndex
CREATE INDEX "educations_admin_id_idx" ON "educations"("admin_id");

-- CreateIndex
CREATE INDEX "educations_sort_order_idx" ON "educations"("sort_order");

-- CreateIndex
CREATE INDEX "skills_admin_id_idx" ON "skills"("admin_id");

-- CreateIndex
CREATE INDEX "skills_category_key_idx" ON "skills"("category_key");

-- CreateIndex
CREATE INDEX "skills_sort_order_idx" ON "skills"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_member_code_key" ON "team_members"("member_code");

-- CreateIndex
CREATE INDEX "team_members_admin_id_idx" ON "team_members"("admin_id");

-- CreateIndex
CREATE INDEX "team_members_sort_order_idx" ON "team_members"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_admin_id_idx" ON "projects"("admin_id");

-- CreateIndex
CREATE INDEX "projects_sort_order_idx" ON "projects"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_admin_id_idx" ON "blogs"("admin_id");

-- CreateIndex
CREATE INDEX "blogs_sort_order_idx" ON "blogs"("sort_order");

-- AddForeignKey
ALTER TABLE "site_configs" ADD CONSTRAINT "site_configs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
