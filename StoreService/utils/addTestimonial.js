// script.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testimonials = [
    {
      name: 'John Doe',
      rating: 5,
      review: 'This is an amazing product! Highly recommend it to everyone.',
      link: 'https://twitter.com/johndoe',
    },
    {
      name: 'Jane Smith',
      rating: 4,
      review: 'Great experience overall, but there is room for improvement.',
      link: null, // No link
    },
    {
      name: 'Emily Johnson',
      rating: 3,
      review: 'It works okay, but not exactly what I expected.',
      link: 'https://instagram.com/emilyjohnson',
    },
    {
      name: 'Michael Brown',
      rating: 2,
      review: 'Not happy with the product, it didn’t meet my expectations.',
      link: null, // No link
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: {
        name: testimonial.name,
        rating: testimonial.rating,
        review: testimonial.review,
        link: testimonial.link,
      },
    });
  }

  //console.log('Testimonial records created!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});
