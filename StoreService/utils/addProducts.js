const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { faker } = require('@faker-js/faker'); // Updated import

// Utility function to generate a slug from product name
const generateSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

async function createProducts() {
  const categories = await prisma.category.findMany({
    where: { NOT: { parentId: null } }, // Fetch only subcategories
    include: { products: true }, // Fetch the products for category
  });

  const productTypes = ['Ring', 'Necklace', 'Bracelet', 'Earring']; // Sample types
  const brands = [ "Tiffany & Co.", "Cartier", "Bvlgari", "Harry Winston", "Van Cleef & Arpels",   ]; // Sample brands

  try {
    // Loop through each category and create products
    for (const category of categories) {
      const categoryName = category.categoryName;
      const slug = generateSlug(categoryName);

      // Randomly assign product data for each category
      for (let i = 0; i < 10; i++) { // Adjust the number of products per category as needed
        const productName = `${categoryName} Product ${i + 1}`;
        const productSlug = generateSlug(productName);

        // Create product
        const product = await prisma.product.create({
          data: {
            name: productName,
            slug: productSlug,
            vendor: 'ADMIN', // You can change the vendor as needed
            price: parseFloat(faker.commerce.price(50, 2000, 2)),
            discountedPrice: parseFloat(faker.commerce.price(50, 2000, 2)),
            quantity: faker.number.int({ min: 10, max: 100 }), // Updated usage
            description: faker.lorem.sentences(2),
            shortDescription: faker.lorem.words(5),
            type: productTypes[i % productTypes.length],
            sku: faker.string.uuid(10),
            brandName: brands[i % brands.length],
            Category: {
              connect: { id: category.id }
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log(`Created Product: ${product.name}`);

        // Create variants for each product
        for (let j = 0; j < 3; j++) { // Adjust the number of variants per product as needed
          const variantName = `${product.name} Variant ${j + 1}`;
          const variantSku = faker.string.uuid(10);
          const variantPrice = parseFloat(faker.commerce.price(50, 2000, 2));
          const variantQuantity = faker.number.int({ min: 10, max: 50 }); // Updated usage

          const productVariant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              variantName: variantName,
              sku: variantSku,
              price: variantPrice,
              quantity: variantQuantity,
              salableQuantity: variantQuantity,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          console.log(`Created Variant: ${productVariant.variantName}`);

          // Add variant attributes
          for (let k = 0; k < 1; k++) { // Adjust the number of attributes per variant as needed
            const attributeName = "color";
            const attributeValue = faker.color.human();

            await prisma.variantAttribute.create({
              data: {
                name: attributeName,
                value: attributeValue,
                productVariantId: productVariant.id,
              },
            });

            console.log(`Created Variant Attribute: ${attributeName} - ${attributeValue}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error creating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProducts();
