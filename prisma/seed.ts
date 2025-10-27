import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  // Create global addons
  const extraCheese = await prisma.addon.create({
    data: {
      name: 'Extra Cheese',
      price: 100, // £1.00
    },
  });

  const garlicSauce = await prisma.addon.create({
    data: {
      name: 'Garlic Sauce',
      price: 80, // £0.80
    },
  });

  const chilliSauce = await prisma.addon.create({
    data: {
      name: 'Chilli Sauce',
      price: 80, // £0.80
    },
  });

  const extraNaan = await prisma.addon.create({
    data: {
      name: 'Extra Naan Bread',
      price: 150, // £1.50
    },
  });

  const mintChutney = await prisma.addon.create({
    data: {
      name: 'Mint Chutney',
      price: 80, // £0.80
    },
  });

  // Afghan Specials
  const kabuliPilau = await prisma.product.create({
    data: {
      name: 'Kabuli Pilau (Lamb Shank)',
      slug: 'kabuli-pilau-lamb-shank',
      description: 'Traditional Afghan rice with raisins, carrots & tender lamb shank',
      category: 'Afghan Specials',
      popular: true,
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 1499, // £14.99
        },
      },
    },
  });

  const chickenBiryani = await prisma.product.create({
    data: {
      name: 'Chicken Biryani',
      slug: 'chicken-biryani',
      description: 'Fragrant spiced rice with chicken & raita',
      category: 'Afghan Specials',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 999, // £9.99
        },
      },
    },
  });

  const lambBiryani = await prisma.product.create({
    data: {
      name: 'Lamb Biryani',
      slug: 'lamb-biryani',
      description: 'Spiced lamb with saffron rice & salad',
      category: 'Afghan Specials',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 1099, // £10.99
        },
      },
    },
  });

  const mantu = await prisma.product.create({
    data: {
      name: 'Mantu',
      slug: 'mantu',
      description: 'Steamed dumplings filled with minced beef, topped with tomato & yoghurt sauce',
      category: 'Afghan Specials',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 899, // £8.99
        },
      },
    },
  });

  const bolani = await prisma.product.create({
    data: {
      name: 'Bolani',
      slug: 'bolani',
      description: 'Crispy flatbread stuffed with potato & herbs',
      category: 'Afghan Specials',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 699, // £6.99
        },
      },
    },
  });

  // Karahi Dishes
  const lambKarahi = await prisma.product.create({
    data: {
      name: 'Lamb Karahi',
      slug: 'lamb-karahi',
      description: 'Tomato, ginger & green chilli base — classic Afghan karahi',
      category: 'Karahi',
      popular: true,
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 1299, // £12.99
        },
      },
    },
  });

  const chickenKarahi = await prisma.product.create({
    data: {
      name: 'Chicken Karahi',
      slug: 'chicken-karahi',
      description: 'Mild or spicy option, cooked in authentic Afghan masala',
      category: 'Karahi',
      allergens: 'Gluten',
      variants: {
        create: [
          {
            name: 'Mild',
            price: 1199, // £11.99
          },
          {
            name: 'Spicy',
            price: 1199, // £11.99
          },
        ],
      },
    },
  });

  const paneerKarahi = await prisma.product.create({
    data: {
      name: 'Paneer Karahi',
      slug: 'paneer-karahi',
      description: 'Cottage cheese in spicy tomato & capsicum gravy',
      category: 'Karahi',
      allergens: 'Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 1099, // £10.99
        },
      },
    },
  });

  const mixKarahi = await prisma.product.create({
    data: {
      name: 'Mix Karahi (Lamb + Chicken)',
      slug: 'mix-karahi',
      description: 'Double meat combo for sharing',
      category: 'Karahi',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 1399, // £13.99
        },
      },
    },
  });

  const vegetableKarahi = await prisma.product.create({
    data: {
      name: 'Vegetable Karahi',
      slug: 'vegetable-karahi',
      description: 'Seasonal veggies in tomato gravy',
      category: 'Karahi',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 949, // £9.49
        },
      },
    },
  });

  // Doner & Grill
  const chickenDoner = await prisma.product.create({
    data: {
      name: 'Chicken Doner',
      slug: 'chicken-doner',
      description: 'Marinated slices with salad & sauce',
      category: 'Doner & Grill',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 899, // £8.99
        },
      },
    },
  });

  const lambDoner = await prisma.product.create({
    data: {
      name: 'Lamb Doner',
      slug: 'lamb-doner',
      description: 'Juicy lamb doner with salad & garlic sauce',
      category: 'Doner & Grill',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 949, // £9.49
        },
      },
    },
  });

  const mixedDoner = await prisma.product.create({
    data: {
      name: 'Mixed Doner',
      slug: 'mixed-doner',
      description: 'Half chicken, half lamb, served on naan',
      category: 'Doner & Grill',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 1049, // £10.49
        },
      },
    },
  });

  const chickenTikka = await prisma.product.create({
    data: {
      name: 'Chicken Tikka',
      slug: 'chicken-tikka',
      description: 'Grilled chunks marinated overnight',
      category: 'Doner & Grill',
      allergens: 'Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 999, // £9.99
        },
      },
    },
  });

  const lambChops = await prisma.product.create({
    data: {
      name: 'Lamb Chops (4pcs)',
      slug: 'lamb-chops',
      description: 'Charcoal grilled, with mint sauce',
      category: 'Doner & Grill',
      allergens: 'Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 1249, // £12.49
        },
      },
    },
  });

  const seekhKebab = await prisma.product.create({
    data: {
      name: 'Seekh Kebab (2pcs)',
      slug: 'seekh-kebab',
      description: 'Spiced minced lamb skewers',
      category: 'Doner & Grill',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 849, // £8.49
        },
      },
    },
  });

  // Pizza
  const margherita = await prisma.product.create({
    data: {
      name: 'Margherita',
      slug: 'margherita',
      description: 'Classic tomato and mozzarella',
      category: 'Pizza',
      allergens: 'Gluten, Dairy',
      variants: {
        create: [
          {
            name: '10"',
            price: 999, // £9.99
          },
          {
            name: '12"',
            price: 1199, // £11.99
          },
        ],
      },
    },
  });

  const chickenTikkaPizza = await prisma.product.create({
    data: {
      name: 'Chicken Tikka Pizza',
      slug: 'chicken-tikka-pizza',
      description: 'Spiced chicken tikka on pizza base',
      category: 'Pizza',
      allergens: 'Gluten, Dairy',
      variants: {
        create: [
          {
            name: '10"',
            price: 1099, // £10.99
          },
          {
            name: '12"',
            price: 1299, // £12.99
          },
        ],
      },
    },
  });

  const pepperoniPizza = await prisma.product.create({
    data: {
      name: 'Pepperoni Pizza',
      slug: 'pepperoni-pizza',
      description: 'Classic pepperoni with mozzarella',
      category: 'Pizza',
      allergens: 'Gluten, Dairy',
      variants: {
        create: [
          {
            name: '10"',
            price: 1099, // £10.99
          },
          {
            name: '12"',
            price: 1299, // £12.99
          },
        ],
      },
    },
  });

  const afghanSpecialPizza = await prisma.product.create({
    data: {
      name: 'Afghan Special Pizza (Lamb & Chilli)',
      slug: 'afghan-special-pizza',
      description: 'Spiced lamb with green chillies',
      category: 'Pizza',
      allergens: 'Gluten, Dairy',
      variants: {
        create: [
          {
            name: '10"',
            price: 1149, // £11.49
          },
          {
            name: '12"',
            price: 1349, // £13.49
          },
        ],
      },
    },
  });

  const vegetarianSupreme = await prisma.product.create({
    data: {
      name: 'Vegetarian Supreme',
      slug: 'vegetarian-supreme',
      description: 'Mixed vegetables and cheese',
      category: 'Pizza',
      allergens: 'Gluten, Dairy',
      variants: {
        create: [
          {
            name: '10"',
            price: 999, // £9.99
          },
          {
            name: '12"',
            price: 1199, // £11.99
          },
        ],
      },
    },
  });

  // Sides
  const chips = await prisma.product.create({
    data: {
      name: 'Chips',
      slug: 'chips',
      description: 'Classic salted fries',
      category: 'Sides',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 299, // £2.99
        },
      },
    },
  });

  const spicyFries = await prisma.product.create({
    data: {
      name: 'Spicy Fries',
      slug: 'spicy-fries',
      description: 'Tossed in house spice blend',
      category: 'Sides',
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 349, // £3.49
        },
      },
    },
  });

  const cheesyChips = await prisma.product.create({
    data: {
      name: 'Cheesy Chips',
      slug: 'cheesy-chips',
      description: 'Melted cheese over crispy fries',
      category: 'Sides',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 449, // £4.49
        },
      },
    },
  });

  const spicyWings = await prisma.product.create({
    data: {
      name: 'Spicy Wings (6pcs)',
      slug: 'spicy-wings',
      description: 'Fiery glazed wings',
      category: 'Sides',
      popular: true,
      allergens: 'Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 599, // £5.99
        },
      },
    },
  });

  const garlicBread = await prisma.product.create({
    data: {
      name: 'Garlic Bread',
      slug: 'garlic-bread',
      description: '4 slices',
      category: 'Sides',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 349, // £3.49
        },
      },
    },
  });

  const saladBox = await prisma.product.create({
    data: {
      name: 'Salad Box',
      slug: 'salad-box',
      description: 'Fresh & crisp',
      category: 'Sides',
      allergens: 'None',
      variants: {
        create: {
          name: 'Standard',
          price: 349, // £3.49
        },
      },
    },
  });

  // Desserts
  const warmCookies = await prisma.product.create({
    data: {
      name: 'Warm Cookies (4pcs)',
      slug: 'warm-cookies',
      description: 'Gooey chocolate chip cookies',
      category: 'Desserts',
      allergens: 'Gluten, Dairy, Eggs',
      variants: {
        create: {
          name: 'Standard',
          price: 449, // £4.49
        },
      },
    },
  });

  const chocolateFudgeCake = await prisma.product.create({
    data: {
      name: 'Chocolate Fudge Cake',
      slug: 'chocolate-fudge-cake',
      description: 'Slice',
      category: 'Desserts',
      allergens: 'Gluten, Dairy, Eggs',
      variants: {
        create: {
          name: 'Standard',
          price: 499, // £4.99
        },
      },
    },
  });

  const gulabJamun = await prisma.product.create({
    data: {
      name: 'Gulab Jamun',
      slug: 'gulab-jamun',
      description: '3 pieces in syrup',
      category: 'Desserts',
      allergens: 'Dairy, Gluten',
      variants: {
        create: {
          name: 'Standard',
          price: 399, // £3.99
        },
      },
    },
  });

  const baklava = await prisma.product.create({
    data: {
      name: 'Baklava (2pcs)',
      slug: 'baklava',
      description: 'Rich pastry with honey & nuts',
      category: 'Desserts',
      allergens: 'Gluten, Nuts',
      variants: {
        create: {
          name: 'Standard',
          price: 349, // £3.49
        },
      },
    },
  });

  // Drinks
  const cocaCola = await prisma.product.create({
    data: {
      name: 'Coca-Cola',
      slug: 'coca-cola',
      description: '330ml can',
      category: 'Drinks',
      allergens: 'None',
      variants: {
        create: {
          name: 'Standard',
          price: 149, // £1.49
        },
      },
    },
  });

  const sprite = await prisma.product.create({
    data: {
      name: 'Sprite',
      slug: 'sprite',
      description: '330ml can',
      category: 'Drinks',
      allergens: 'None',
      variants: {
        create: {
          name: 'Standard',
          price: 149, // £1.49
        },
      },
    },
  });

  const fantaOrange = await prisma.product.create({
    data: {
      name: 'Fanta Orange',
      slug: 'fanta-orange',
      description: '330ml can',
      category: 'Drinks',
      allergens: 'None',
      variants: {
        create: {
          name: 'Standard',
          price: 149, // £1.49
        },
      },
    },
  });

  const water = await prisma.product.create({
    data: {
      name: 'Water',
      slug: 'water',
      description: '500ml',
      category: 'Drinks',
      allergens: 'None',
      variants: {
        create: {
          name: 'Standard',
          price: 100, // £1.00
        },
      },
    },
  });

  const mangoLassi = await prisma.product.create({
    data: {
      name: 'Mango Lassi',
      slug: 'mango-lassi',
      description: '500ml',
      category: 'Drinks',
      allergens: 'Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 349, // £3.49
        },
      },
    },
  });

  // Deals
  const nomadsDeal1 = await prisma.product.create({
    data: {
      name: "Nomad's Deal 1",
      slug: 'nomads-deal-1',
      description: 'Lamb Doner, Chicken Doner, Chips, Kabuli Pilau Rice, Salad, Sauces & 2 Drinks',
      category: 'Deals',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 1799, // £17.99
        },
      },
    },
  });

  const nomadsDeal2 = await prisma.product.create({
    data: {
      name: "Nomad's Deal 2",
      slug: 'nomads-deal-2',
      description: 'Any Medium Pizza + Chicken Strips or Wings + Chips + Drink',
      category: 'Deals',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 1999, // £19.99
        },
      },
    },
  });

  const nomadsDeal3 = await prisma.product.create({
    data: {
      name: "Nomad's Deal 3",
      slug: 'nomads-deal-3',
      description: 'Two Medium Pizzas + Warm Cookies + Chips/Fries + 2 Drinks',
      category: 'Deals',
      allergens: 'Gluten, Dairy, Eggs',
      variants: {
        create: {
          name: 'Standard',
          price: 3199, // £31.99
        },
      },
    },
  });

  const nomadsDeal4 = await prisma.product.create({
    data: {
      name: "Nomad's Deal 4",
      slug: 'nomads-deal-4',
      description: 'Any Two Large Pizzas',
      category: 'Deals',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 2599, // £25.99
        },
      },
    },
  });

  const afghanFamilyPlatter = await prisma.product.create({
    data: {
      name: 'Afghan Family Platter',
      slug: 'afghan-family-platter',
      description: 'Mix Grill (Lamb, Chicken, Kebab) + Pilau + Bread + Salad + Sauces',
      category: 'Deals',
      allergens: 'Gluten, Dairy',
      variants: {
        create: {
          name: 'Standard',
          price: 3999, // £39.99
        },
      },
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
