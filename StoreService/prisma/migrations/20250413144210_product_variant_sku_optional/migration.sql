-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "sku" DROP NOT NULL;
