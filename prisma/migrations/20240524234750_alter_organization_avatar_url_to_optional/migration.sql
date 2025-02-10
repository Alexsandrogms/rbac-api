/*
  Warnings:

  - Made the column `avatar_url` on table `projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "avatar_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "avatar_url" SET NOT NULL;
