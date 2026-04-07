-- AlterTable
ALTER TABLE "site_configs" ADD COLUMN "hero_image_url" TEXT;
ALTER TABLE "site_configs" ADD COLUMN "about_secondary_description_en" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "about_secondary_description_bn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "years_experience" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "site_configs" ADD COLUMN "about_image_primary_url" TEXT;
ALTER TABLE "site_configs" ADD COLUMN "about_image_secondary_url" TEXT;
ALTER TABLE "site_configs" ADD COLUMN "about_image_tertiary_url" TEXT;

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_bn" TEXT NOT NULL,
    "company_en" TEXT NOT NULL,
    "company_bn" TEXT NOT NULL,
    "period_en" TEXT NOT NULL,
    "period_bn" TEXT NOT NULL,
    "details_en" TEXT NOT NULL DEFAULT '',
    "details_bn" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "experiences_admin_id_idx" ON "experiences"("admin_id");

-- CreateIndex
CREATE INDEX "experiences_sort_order_idx" ON "experiences"("sort_order");

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
