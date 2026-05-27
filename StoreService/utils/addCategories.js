require('dotenv').config({ path: '.env.development' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Utility function to generate a slug from category name
const generateSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

async function createCategories() {
  const parentCategories = [
    'Rings',
    'Necklaces',
    'Bracelets',
    'Earrings'
  ];

  const tags = ['ShopByType', 'ShopByCollection', 'ShopByOccasion'];

  const subcategoryNames = {
    'Rings': [
      'Engagement Rings', 'Wedding Bands', 'Solitaire Rings', 'Diamond Rings', 
      'Gold Rings', 'Silver Rings', 'Custom Rings', 'Cocktail Rings', 
      'Birthstone Rings', 'Promise Rings', 'Fashion Rings', 'Men\'s Rings'
    ],
    'Necklaces': [
      'Pendant Necklaces', 'Chokers', 'Statement Necklaces', 'Gold Necklaces', 
      'Diamond Necklaces', 'Pearl Necklaces', 'Silver Necklaces', 'Layered Necklaces', 
      'Lockets', 'Birthstone Necklaces', 'Custom Necklaces', 'Fashion Necklaces'
    ],
    'Bracelets': [
      'Charm Bracelets', 'Bangle Bracelets', 'Cuff Bracelets', 'Gold Bracelets', 
      'Diamond Bracelets', 'Silver Bracelets', 'Tennis Bracelets', 'Leather Bracelets', 
      'Men\'s Bracelets', 'Chain Bracelets', 'Beaded Bracelets', 'Custom Bracelets'
    ],
    'Earrings': [
      'Stud Earrings', 'Hoop Earrings', 'Drop Earrings', 'Diamond Earrings', 
      'Gold Earrings', 'Silver Earrings', 'Chandelier Earrings', 'Ear Cuffs', 
      'Pearl Earrings', 'Fashion Earrings', 'Men\'s Earrings', 'Clip-On Earrings'
    ]
  };

  try {
    // Loop through each parent category
    for (const parentCategoryName of parentCategories) {
      const slug = generateSlug(parentCategoryName);

      // Create a parent category
      const parentCategory = await prisma.category.create({
        data: {
          categoryName: parentCategoryName,
          slug: slug,
          isParent: true
        }
      });

      console.log(`Created Parent Category: ${parentCategory.categoryName}`);

      // Create subcategories for the parent category
      for (let i = 0; i < subcategoryNames[parentCategoryName].length; i++) {
        const subcategoryName = subcategoryNames[parentCategoryName][i];
        const subcategorySlug = generateSlug(subcategoryName);

        // Check if slug already exists, and adjust if necessary
        let finalSlug = subcategorySlug;
        let slugExists = await prisma.category.findUnique({
          where: { slug: finalSlug }
        });

        // If the slug exists, append a unique identifier (e.g., number)
        let count = 1;
        while (slugExists) {
          finalSlug = `${subcategorySlug}-${count}`;
          slugExists = await prisma.category.findUnique({
            where: { slug: finalSlug }
          });
          count++;
        }

        // Create the subcategory
        const subcategory = await prisma.category.create({
          data: {
            categoryName: subcategoryName,
            slug: finalSlug,
            parentId: parentCategory.id,
            isParent: false
          }
        });

        console.log(`Created Subcategory: ${subcategory.categoryName}`);

        // Assign tags to subcategories
        const tagIndex = i % tags.length; // Round-robin distribution of tags
        const tagName = tags[tagIndex];

        const tag = await prisma.tag.upsert({
          where: {
            name_isCategory: {
              name: tagName,
              isCategory: true
            }
          },
          update: {},
          create: {
            name: tagName,
            isCategory: true
          }
        });

        // Assign the tag to the subcategory (through Category-Tag relation)
        await prisma.category.update({
            where: { id: subcategory.id },
            data: {
              Tag: {
                connect: { id: tag.id }  // This connects the Tag to the Category
              }
            }
          });

        console.log(`Assigned Tag: ${tag.name} to Subcategory ${subcategoryName}`);
      }
    }
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCategories();
