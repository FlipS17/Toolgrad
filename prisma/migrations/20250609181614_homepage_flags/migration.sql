-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
