import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function buildMockCategories() {
  return MOCK_PRODUCTS.reduce<Record<string, typeof MOCK_PRODUCTS>>((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});
}

async function getProductsByCategory() {
  if (DISABLE_DB) {
    return buildMockCategories();
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error'],
    });
    
    // Add timeout to database operations to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout after 5 seconds')), 5000);
    });

    // Fetch category order with timeout
    const categoriesPromise = prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const categories = await Promise.race([categoriesPromise, timeoutPromise]) as Awaited<typeof categoriesPromise>;
    const categoryOrder = categories.map(c => c.name);
    
    // Fetch products with timeout
    const productsPromise = prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    const products = await Promise.race([productsPromise, timeoutPromise]) as Awaited<typeof productsPromise>;

    await prisma.$disconnect();

    const productsByCategory = products.reduce<Record<string, typeof products>>((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    // Sort categories by order, then add any missing ones
    const orderedCategories: Record<string, typeof products> = {};
    categoryOrder.forEach(catName => {
      if (productsByCategory[catName]) {
        orderedCategories[catName] = productsByCategory[catName];
      }
    });
    // Add any categories not in the order list
    Object.keys(productsByCategory).forEach(catName => {
      if (!orderedCategories[catName]) {
        orderedCategories[catName] = productsByCategory[catName];
      }
    });

    return orderedCategories;
  } catch (error) {
    console.error('Failed to fetch menu products from database. Falling back to mock data.', error);
    return buildMockCategories();
  }
}

export default async function MenuPage() {
  const categories = await getProductsByCategory();
  const categoryNames = Object.keys(categories);
  const defaultCategory = categoryNames[0] ?? '';

  return (
    <main className="py-8 md:py-16 bg-black pt-20 md:pt-24">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">
            Our Menu
          </h1>
          <p className="text-sm md:text-lg text-gray-300">
            Authentic Afghan flavors, prepared fresh daily
          </p>
        </div>

        {!categoryNames.length ? (
          <p className="text-center text-gray-300">
            Menu is currently unavailable. Please check back soon.
          </p>
        ) : (
          <Tabs defaultValue={defaultCategory} className="w-full">
          <div className="mb-6 md:mb-8 w-full">
            <TabsList className="grid grid-cols-2 md:flex md:flex-wrap w-full bg-gray-800 border border-gray-700 rounded-lg p-2 md:p-2 gap-2 md:gap-2 justify-start items-start">
              {categoryNames.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="text-sm md:text-sm text-gray-300 hover:text-white transition-all duration-200 menu-tab-trigger whitespace-nowrap px-4 py-3 justify-center"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categoryNames.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {categories[category].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        )}
      </div>
    </main>
  );
}
