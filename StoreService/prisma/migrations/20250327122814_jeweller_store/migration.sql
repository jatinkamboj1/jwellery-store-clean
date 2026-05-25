/*
  Warnings:

  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_CartDiscounts" ADD CONSTRAINT "_CartDiscounts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CartDiscounts_AB_unique";

-- AlterTable
ALTER TABLE "_CategoryImages" ADD CONSTRAINT "_CategoryImages_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryImages_AB_unique";

-- AlterTable
ALTER TABLE "_CategoryProducts" ADD CONSTRAINT "_CategoryProducts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryProducts_AB_unique";

-- AlterTable
ALTER TABLE "_CategoryTags" ADD CONSTRAINT "_CategoryTags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryTags_AB_unique";

-- AlterTable
ALTER TABLE "_OrderDiscounts" ADD CONSTRAINT "_OrderDiscounts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OrderDiscounts_AB_unique";

-- AlterTable
ALTER TABLE "_ProductTags" ADD CONSTRAINT "_ProductTags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductTags_AB_unique";
