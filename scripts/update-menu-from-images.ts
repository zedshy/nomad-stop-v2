import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive Menu Update Script
 * Based on the new menu images provided
 * 
 * This script will:
 * 1. Update existing product prices
 * 2. Add new products
 * 3. Update variants (e.g., Doner now has Medium/Large instead of Standard)
 */

interface PriceUpdate {
  productName: string;
  variantName: string;
  newPrice: number;
}

interface NewProduct {
  name: string;
  slug: string;
  description: string;
  category: string;
  popular: boolean;
  allergens: string;
  variants: Array<{ name: string; price: number }>;
}

// Price updates for existing products
const priceUpdates: PriceUpdate[] = [
  // Afghan Specials
  { productName: 'Kabuli Pilau (Lamb Shank)', variantName: 'Standard', newPrice: 14.95 },
  { productName: 'Mantu', variantName: 'Standard', newPrice: 11.95 },
  { productName: 'Lamb Karahi', variantName: 'Standard', newPrice: 10.95 },
  { productName: 'Chicken Karahi', variantName: 'Mild', newPrice: 9.95 },
  { productName: 'Chicken Karahi', variantName: 'Spicy', newPrice: 9.95 },
  { productName: 'Lamb Biryani', variantName: 'Standard', newPrice: 11.95 },
  { productName: 'Chicken Biryani', variantName: 'Standard', newPrice: 10.95 },
  
  // Doner - Need to update to Medium/Large variants
  // These will be handled separately as they need variant changes
  
  // Pizza - New prices for 10" and 12"
  { productName: 'Margherita', variantName: '10"', newPrice: 12.99 },
  { productName: 'Margherita', variantName: '12"', newPrice: 14.99 },
  { productName: 'Pepperoni Pizza', variantName: '10"', newPrice: 12.99 },
  { productName: 'Pepperoni Pizza', variantName: '12"', newPrice: 14.99 },
  { productName: 'Chicken Tikka Pizza', variantName: '10"', newPrice: 12.99 },
  { productName: 'Chicken Tikka Pizza', variantName: '12"', newPrice: 14.99 },
  { productName: 'Vegetarian Supreme', variantName: '10"', newPrice: 12.99 },
  { productName: 'Vegetarian Supreme', variantName: '12"', newPrice: 14.99 },
  { productName: 'Afghan Special Pizza (Lamb & Chilli)', variantName: '10"', newPrice: 12.99 },
  { productName: 'Afghan Special Pizza (Lamb & Chilli)', variantName: '12"', newPrice: 14.99 },
  
  // Sides
  { productName: 'Chips', variantName: 'Standard', newPrice: 1.99 },
  { productName: 'Garlic Bread', variantName: 'Standard', newPrice: 2.99 },
  { productName: 'Spicy Wings (6pcs)', variantName: 'Standard', newPrice: 4.99 },
  
  // Drinks
  { productName: 'Coca-Cola', variantName: 'Standard', newPrice: 1.49 },
  { productName: 'Fanta Orange', variantName: 'Standard', newPrice: 1.49 },
  { productName: 'Sprite', variantName: 'Standard', newPrice: 1.49 },
];

// New products to add
const newProducts: NewProduct[] = [
  // New Afghan items
  {
    name: 'Lamb Charsi Karahi (0.5kg)',
    slug: 'lamb-charsi-karahi',
    description: 'Lamb on the bone with fresh tomatoes, chillies, herbs and spices. Served with 2 naans.',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 2295 }], // £22.95
  },
  {
    name: 'Chapli Kebab',
    slug: 'chapli-kebab',
    description: 'Mince lamb marinated in spices.',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 1495 }], // £14.95
  },
  {
    name: 'Lamb Keema',
    slug: 'lamb-keema',
    description: 'Minced lamb curry',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 995 }], // £9.95
  },
  {
    name: 'Lamb Saag',
    slug: 'lamb-saag',
    description: 'Lamb with spinach curry',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 1095 }], // £10.95
  },
  {
    name: 'Chicken Saag',
    slug: 'chicken-saag',
    description: 'Chicken with spinach curry',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 995 }], // £9.95
  },
  {
    name: 'Karahi or Saag Paneer',
    slug: 'karahi-saag-paneer',
    description: 'Cottage cheese in karahi or saag style',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 895 }], // £8.95
  },
  {
    name: 'Red Kidney Beans',
    slug: 'red-kidney-beans',
    description: 'Red kidney beans curry',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 695 }], // £6.95
  },
  {
    name: 'Chickpeas Curry',
    slug: 'chickpeas-curry',
    description: 'Chickpeas in curry sauce',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 695 }], // £6.95
  },
  {
    name: 'Okra',
    slug: 'okra',
    description: 'Okra curry',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 795 }], // £7.95
  },
  {
    name: 'Chilli Paneer',
    slug: 'chilli-paneer',
    description: 'Spicy paneer with chillies',
    category: 'Afghan Specials',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 895 }], // £8.95
  },
  
  // Pasta section
  {
    name: 'Spaghetti Bolognese',
    slug: 'spaghetti-bolognese',
    description: 'Classic spaghetti with meat sauce',
    category: 'Pasta',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  {
    name: 'Beef Lasagne',
    slug: 'beef-lasagne',
    description: 'Layered pasta with beef and cheese',
    category: 'Pasta',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  {
    name: 'Veggie Lasagne',
    slug: 'veggie-lasagne',
    description: 'Vegetarian lasagne',
    category: 'Pasta',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  {
    name: 'Chicken & Mushroom Pasta',
    slug: 'chicken-mushroom-pasta',
    description: 'Creamy chicken and mushroom pasta',
    category: 'Pasta',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  
  // Wraps
  {
    name: 'Halloumi Wrap',
    slug: 'halloumi-wrap',
    description: 'Grilled halloumi in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: 'Standard', price: 899 }, // £8.99
      { name: 'Meal', price: 1149 }, // £11.49
    ],
  },
  {
    name: 'Paneer Tikka Wrap',
    slug: 'paneer-tikka-wrap',
    description: 'Paneer tikka in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: 'Standard', price: 899 }, // £8.99
      { name: 'Meal', price: 1149 }, // £11.49
    ],
  },
  {
    name: 'Lamb Tikka Wrap',
    slug: 'lamb-tikka-wrap',
    description: 'Lamb tikka in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Standard', price: 999 }, // £9.99
      { name: 'Meal', price: 1249 }, // £12.49
    ],
  },
  {
    name: 'Chicken Tikka Wrap',
    slug: 'chicken-tikka-wrap',
    description: 'Chicken tikka in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Standard', price: 999 }, // £9.99
      { name: 'Meal', price: 1249 }, // £12.49
    ],
  },
  {
    name: 'Chicken Kofta Wrap',
    slug: 'chicken-kofta-wrap',
    description: 'Chicken kofta in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Standard', price: 799 }, // £7.99
      { name: 'Meal', price: 1049 }, // £10.49
    ],
  },
  {
    name: 'Lamb Kofta Wrap',
    slug: 'lamb-kofta-wrap',
    description: 'Lamb kofta in fresh naan with salad and sauce',
    category: 'Wraps',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Standard', price: 799 }, // £7.99
      { name: 'Meal', price: 1049 }, // £10.49
    ],
  },
  
  // Rice items
  {
    name: 'Kabuli Pilau Rice',
    slug: 'kabuli-pilau-rice',
    description: 'Fragrant basmati rice with raisins and carrots',
    category: 'Rice',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 599 }], // £5.99
  },
  {
    name: 'Egg Fried Rice',
    slug: 'egg-fried-rice',
    description: 'Fried rice with egg',
    category: 'Rice',
    popular: false,
    allergens: 'Eggs',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Plain Rice',
    slug: 'plain-rice',
    description: 'Steamed basmati rice',
    category: 'Rice',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 350 }], // £3.50
  },
  
  // Grill items - need to update existing ones and add new
  {
    name: 'Mix Grill',
    slug: 'mix-grill',
    description: 'Lamb chops, chicken tikka, lamb tikka, grilled chicken wings, lamb kofta and chicken kofta and 2 naans',
    category: 'Grill',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Large', price: 3495 }], // £34.95
  },
  {
    name: 'Lamb Tikka',
    slug: 'lamb-tikka',
    description: 'Grilled lamb tikka',
    category: 'Grill',
    popular: false,
    allergens: 'Dairy',
    variants: [
      { name: 'Medium', price: 1195 }, // £11.95
      { name: 'Large', price: 1595 }, // £15.95
    ],
  },
  {
    name: 'Lamb Kofta',
    slug: 'lamb-kofta',
    description: 'Spiced lamb kofta',
    category: 'Grill',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Medium', price: 995 }, // £9.95
      { name: 'Large', price: 1395 }, // £13.95
    ],
  },
  {
    name: 'Chicken Kofta',
    slug: 'chicken-kofta',
    description: 'Spiced chicken kofta',
    category: 'Grill',
    popular: false,
    allergens: 'Gluten',
    variants: [
      { name: 'Medium', price: 995 }, // £9.95
      { name: 'Large', price: 1395 }, // £13.95
    ],
  },
  {
    name: 'Paneer Tikka',
    slug: 'paneer-tikka',
    description: 'Grilled paneer tikka',
    category: 'Grill',
    popular: false,
    allergens: 'Dairy',
    variants: [
      { name: 'Medium', price: 795 }, // £7.95
      { name: 'Large', price: 1095 }, // £10.95
    ],
  },
  {
    name: 'Chicken Wings (8 pcs)',
    slug: 'chicken-wings-8pcs',
    description: 'Grilled chicken wings',
    category: 'Grill',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 795 }], // £7.95
  },
  {
    name: 'Quarter Chicken with Kabuli Pilau Rice',
    slug: 'quarter-chicken-pilau',
    description: 'Quarter chicken served with kabuli pilau rice',
    category: 'Grill',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 795 }], // £7.95
  },
  
  // Burgers
  {
    name: 'Beef Burger',
    slug: 'beef-burger',
    description: 'Classic beef burger',
    category: 'Burgers',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: 'Standard', price: 499 }, // £4.99
      { name: 'Meal', price: 749 }, // £7.49
    ],
  },
  {
    name: 'Chicken Burger',
    slug: 'chicken-burger',
    description: 'Chicken burger',
    category: 'Burgers',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: 'Standard', price: 499 }, // £4.99
      { name: 'Meal', price: 749 }, // £7.49
    ],
  },
  {
    name: 'Fish Burger',
    slug: 'fish-burger',
    description: 'Fish burger',
    category: 'Burgers',
    popular: false,
    allergens: 'Gluten, Dairy, Fish',
    variants: [
      { name: 'Standard', price: 399 }, // £3.99
      { name: 'Meal', price: 649 }, // £6.49
    ],
  },
  {
    name: 'Veggie Burger',
    slug: 'veggie-burger',
    description: 'Vegetarian burger',
    category: 'Burgers',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: 'Standard', price: 399 }, // £3.99
      { name: 'Meal', price: 649 }, // £6.49
    ],
  },
  
  // New Sides
  {
    name: 'Jalapeno Poppers (5 pcs)',
    slug: 'jalapeno-poppers',
    description: 'Breaded jalapeno poppers',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Cheesy Garlic Bread (4 pcs)',
    slug: 'cheesy-garlic-bread',
    description: 'Garlic bread with cheese',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Mozzarella Sticks (6 pcs)',
    slug: 'mozzarella-sticks',
    description: 'Breaded mozzarella sticks',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Onion Rings (10 pcs)',
    slug: 'onion-rings',
    description: 'Breaded onion rings',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 449 }], // £4.49
  },
  {
    name: 'Potato Wedges',
    slug: 'potato-wedges',
    description: 'Crispy potato wedges',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Curly Fries',
    slug: 'curly-fries',
    description: 'Crispy curly fries',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Chicken Goujons (6 pcs)',
    slug: 'chicken-goujons',
    description: 'Breaded chicken goujons',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Chicken Nuggets (6 pcs)',
    slug: 'chicken-nuggets',
    description: 'Breaded chicken nuggets',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Barbeque Wings (6 pcs)',
    slug: 'bbq-wings',
    description: 'BBQ glazed wings',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Plain Naan or Butter Naan',
    slug: 'plain-butter-naan',
    description: 'Fresh naan bread',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 199 }], // £1.99
  },
  {
    name: 'Garlic Naan or Garlic Chilli Naan',
    slug: 'garlic-naan',
    description: 'Garlic naan or garlic chilli naan',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 249 }], // £2.49
  },
  {
    name: 'Keema Naan',
    slug: 'keema-naan',
    description: 'Naan stuffed with minced meat',
    category: 'Sides',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Plain Yoghurt',
    slug: 'plain-yoghurt',
    description: 'Plain yoghurt',
    category: 'Sides',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 249 }], // £2.49
  },
  {
    name: 'Aubergine Raita',
    slug: 'aubergine-raita',
    description: 'Yoghurt with aubergine',
    category: 'Sides',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 349 }], // £3.49
  },
  
  // New Pizza types from second menu
  // Pizza base prices: 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
  {
    name: 'Nomad Special',
    slug: 'nomad-special-pizza',
    description: 'Pepperoni, Beef, Ham, Mushrooms, Onions, Peppers, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Nomad Torch',
    slug: 'nomad-torch-pizza',
    description: 'Pepperoni, Chicken Tikka, Onions, Green Chillies, Jalapeno, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Hot Chicken Pizza',
    slug: 'hot-chicken-pizza',
    description: 'Tandoori Chicken, Mushrooms, Onions, Mix Peppers, Jalapeno, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Meat Feast',
    slug: 'meat-feast-pizza',
    description: 'Pepperoni, Beef, Bacon, Ham, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Barbeque Feast',
    slug: 'bbq-feast-pizza',
    description: 'Pepperoni, Meatballs, Bacon, Sausage, Nomad\'s Barbeque Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Original Barbeque',
    slug: 'original-bbq-pizza',
    description: 'Roast Chicken, Onions, Mix Peppers, Nomad\'s Barbeque Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Mexicana',
    slug: 'mexicana-pizza',
    description: 'Spicy Beef, Onions, Tomatoes, Green Chillies, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Hawaiian',
    slug: 'hawaiian-pizza',
    description: 'Ham, Pineapple, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Vegetarian Pizza',
    slug: 'vegetarian-pizza',
    description: 'Mushrooms, Onions, Mix Peppers, Sweet Corn, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  {
    name: 'Vegetarian Hot Pizza',
    slug: 'vegetarian-hot-pizza',
    description: 'Mushrooms, Onions, Mix Peppers, Jalapeno, Nomad\'s Tomato Sauce',
    category: 'Pizza',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [
      { name: '7"', price: 799 },
      { name: '10"', price: 1299 },
      { name: '12"', price: 1499 },
      { name: '14"', price: 1699 },
    ],
  },
  
  // New Desserts
  {
    name: "Ben & Jerry's Ice Cream",
    slug: 'ben-jerrys-ice-cream',
    description: 'Cookie Dough, Caramel ChewChew, Marshmallow Swirls',
    category: 'Desserts',
    popular: false,
    allergens: 'Dairy, Gluten',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  {
    name: 'Haagen Dazs Ice Cream',
    slug: 'haagen-dazs-ice-cream',
    description: 'Belgium Chocolate, Cookies and Cream, Strawberry Cheesecake, Vanilla',
    category: 'Desserts',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 799 }], // £7.99
  },
  {
    name: 'Cakes',
    slug: 'cakes',
    description: 'Chocolate fudge cake, Strawberry Cheesecake, Carrot cake, Banoffee Pie, Hanky Panky',
    category: 'Desserts',
    popular: false,
    allergens: 'Gluten, Dairy, Eggs',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Cookie Churros (4 pcs)',
    slug: 'cookie-churros',
    description: 'Sweet churros',
    category: 'Desserts',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Warm Cookies (4 pcs)',
    slug: 'warm-cookies',
    description: 'Freshly baked warm cookies',
    category: 'Desserts',
    popular: false,
    allergens: 'Gluten, Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Gulab Jamun (2 pcs)',
    slug: 'gulab-jamun-2pcs',
    description: 'Sweet dumplings in syrup',
    category: 'Desserts',
    popular: false,
    allergens: 'Dairy, Gluten',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  {
    name: 'Ras Malai (2 pcs)',
    slug: 'ras-malai',
    description: 'Sweet milk dessert',
    category: 'Desserts',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 499 }], // £4.99
  },
  
  // New Drinks
  {
    name: 'Glass Soft Drink (330ml)',
    slug: 'glass-soft-drink',
    description: 'Soft drink served in a glass',
    category: 'Drinks',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 299 }], // £2.99
  },
  {
    name: 'Large Bottle Soft Drink (1.25l)',
    slug: 'large-bottle-soft-drink',
    description: 'Large bottle of soft drink',
    category: 'Drinks',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Red Bull',
    slug: 'red-bull',
    description: 'Energy drink',
    category: 'Drinks',
    popular: false,
    allergens: 'None',
    variants: [{ name: 'Standard', price: 249 }], // £2.49
  },
  {
    name: 'Mango Lassi',
    slug: 'mango-lassi',
    description: 'Mango yoghurt drink',
    category: 'Drinks',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 399 }], // £3.99
  },
  {
    name: 'Ayran',
    slug: 'ayran',
    description: 'Salty yoghurt drink',
    category: 'Drinks',
    popular: false,
    allergens: 'Dairy',
    variants: [{ name: 'Standard', price: 149 }], // £1.49
  },
];

async function main() {
  console.log('🔄 Updating Menu from New Menu Images\n');
  console.log('='.repeat(80));

  // Step 1: Update existing prices
  console.log('\n1️⃣  Updating existing product prices...\n');
  let updatedCount = 0;
  let failedCount = 0;

  for (const update of priceUpdates) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: update.productName },
        include: { variants: true },
      });

      if (!product) {
        console.log(`⚠️  Product not found: ${update.productName}`);
        failedCount++;
        continue;
      }

      const variant = product.variants.find((v) => v.name === update.variantName);
      if (!variant) {
        console.log(`⚠️  Variant not found: ${update.productName} - ${update.variantName}`);
        failedCount++;
        continue;
      }

      const oldPrice = variant.price;
      const newPriceInPence = Math.round(update.newPrice * 100);

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { price: newPriceInPence },
      });

      console.log(`✅ ${update.productName} - ${update.variantName}: £${(oldPrice / 100).toFixed(2)} → £${update.newPrice.toFixed(2)}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error updating ${update.productName}:`, error);
      failedCount++;
    }
  }

  // Step 2: Update Doner products to have Medium/Large variants
  console.log('\n2️⃣  Updating Doner products to Medium/Large variants...\n');
  
  const donerUpdates = [
    { productName: 'Lamb Doner', medium: 7.99, large: 9.99 },
    { productName: 'Chicken Doner', medium: 7.99, large: 9.99 },
    { productName: 'Mixed Doner', medium: 8.99, large: 10.99 },
  ];

  for (const doner of donerUpdates) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: doner.productName },
        include: { variants: true },
      });

      if (product) {
        // Delete old Standard variant
        if (product.variants.length > 0) {
          await prisma.productVariant.deleteMany({
            where: { productId: product.id },
          });
        }

        // Create new Medium and Large variants
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Medium', price: Math.round(doner.medium * 100) },
            { productId: product.id, name: 'Large', price: Math.round(doner.large * 100) },
          ],
        });

        console.log(`✅ ${doner.productName}: Updated to Medium £${doner.medium.toFixed(2)} / Large £${doner.large.toFixed(2)}`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${doner.productName}:`, error);
      failedCount++;
    }
  }

  // Step 3: Update Pizza sizes - add 7" and 14" variants, update 10" and 12" prices
  console.log('\n3️⃣  Updating Pizza sizes and prices...\n');
  
  const pizzaProducts = [
    'Margherita',
    'Pepperoni Pizza',
    'Chicken Tikka Pizza',
    'Vegetarian Supreme',
    'Afghan Special Pizza (Lamb & Chilli)',
  ];

  for (const pizzaName of pizzaProducts) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: pizzaName },
        include: { variants: true },
      });

      if (product) {
        // Update existing 10" and 12" prices
        const variant10 = product.variants.find((v) => v.name === '10"');
        const variant12 = product.variants.find((v) => v.name === '12"');

        if (variant10) {
          await prisma.productVariant.update({
            where: { id: variant10.id },
            data: { price: 1299 }, // £12.99
          });
        }

        if (variant12) {
          await prisma.productVariant.update({
            where: { id: variant12.id },
            data: { price: 1499 }, // £14.99
          });
        }

        // Add 7" and 14" variants if they don't exist
        const has7 = product.variants.some((v) => v.name === '7"');
        const has14 = product.variants.some((v) => v.name === '14"');

        if (!has7) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: '7"',
              price: 799, // £7.99
            },
          });
        }

        if (!has14) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: '14"',
              price: 1699, // £16.99
            },
          });
        }

        console.log(`✅ ${pizzaName}: Updated sizes and prices`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${pizzaName}:`, error);
      failedCount++;
    }
  }

  // Step 4: Update Grill items to have Medium/Large variants
  console.log('\n4️⃣  Updating Grill items...\n');
  
  // Update Lamb Chops price
  try {
    const lambChops = await prisma.product.findFirst({
      where: { name: 'Lamb Chops (4pcs)' },
      include: { variants: true },
    });

    if (lambChops && lambChops.variants[0]) {
      await prisma.productVariant.update({
        where: { id: lambChops.variants[0].id },
        data: { price: 1495 }, // £14.95
      });
      console.log(`✅ Lamb Chops (4pcs): Updated to £14.95`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error updating Lamb Chops:`, error);
    failedCount++;
  }

  // Update Chicken Tikka to Medium/Large
  try {
    const chickenTikka = await prisma.product.findFirst({
      where: { name: 'Chicken Tikka' },
      include: { variants: true },
    });

    if (chickenTikka) {
      // Delete old variant
      if (chickenTikka.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { productId: chickenTikka.id },
        });
      }

      // Create Medium and Large
      await prisma.productVariant.createMany({
        data: [
          { productId: chickenTikka.id, name: 'Medium', price: 995 }, // £9.95
          { productId: chickenTikka.id, name: 'Large', price: 1395 }, // £13.95
        ],
      });
      console.log(`✅ Chicken Tikka: Updated to Medium £9.95 / Large £13.95`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error updating Chicken Tikka:`, error);
    failedCount++;
  }

  // Step 5: Add new products
  console.log('\n5️⃣  Adding new products...\n');
  let addedCount = 0;

  for (const newProduct of newProducts) {
    try {
      // Check if product already exists
      const existing = await prisma.product.findFirst({
        where: { slug: newProduct.slug },
      });

      if (existing) {
        console.log(`⚠️  Product already exists: ${newProduct.name}`);
        continue;
      }

      await prisma.product.create({
        data: {
          name: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          category: newProduct.category,
          popular: newProduct.popular,
          allergens: newProduct.allergens,
          variants: {
            create: newProduct.variants.map((v) => ({
              name: v.name,
              price: v.price,
            })),
          },
        },
      });

      console.log(`✅ Added: ${newProduct.name}`);
      addedCount++;
    } catch (error) {
      console.error(`❌ Error adding ${newProduct.name}:`, error);
      failedCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Update Summary:\n');
  console.log(`✅ Prices updated: ${updatedCount}`);
  console.log(`✅ New products added: ${addedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('\n✅ Menu update complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

