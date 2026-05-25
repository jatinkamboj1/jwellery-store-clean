/*
  Warnings:

  - You are about to drop the column `shippingCity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingState` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingStreet` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingZip` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingState",
DROP COLUMN "shippingStreet",
DROP COLUMN "shippingZip";
