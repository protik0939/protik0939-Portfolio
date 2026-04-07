-- AlterTable
ALTER TABLE "site_configs" ADD COLUMN "github_contribution_embed" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "codeforces_heatmap_embed" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "codechef_heatmap_embed" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "problem_solving_summary_en" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "problem_solving_summary_bn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_configs" ADD COLUMN "codeforces_current_rating" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "site_configs" ADD COLUMN "codeforces_max_rating" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "site_configs" ADD COLUMN "codechef_current_rating" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "site_configs" ADD COLUMN "codechef_max_rating" INTEGER NOT NULL DEFAULT 0;
