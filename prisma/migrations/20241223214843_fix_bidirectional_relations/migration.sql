/*
  Warnings:

  - You are about to drop the column `folderId` on the `file` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "file_folderId_fkey";

-- DropIndex
DROP INDEX "file_name_folderId_key";

-- DropIndex
DROP INDEX "folder_name_userId_key";

-- AlterTable
ALTER TABLE "file" DROP COLUMN "folderId";

-- CreateTable
CREATE TABLE "FileFolder" (
    "fileId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "FileFolder_pkey" PRIMARY KEY ("fileId","folderId")
);

-- AddForeignKey
ALTER TABLE "FileFolder" ADD CONSTRAINT "FileFolder_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileFolder" ADD CONSTRAINT "FileFolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
