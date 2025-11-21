import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

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
    const prisma = new PrismaClient();
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    await prisma.$disconnect();

    return products.reduce<Record<string, typeof products>>((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
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
    <main className="py-16 bg-black pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Menu
          </h1>
          <p className="text-lg text-gray-300">
            Authentic Afghan flavors, prepared fresh daily
          </p>
        </div>

        {!categoryNames.length ? (
          <p className="text-center text-gray-300">
            Menu is currently unavailable. Please check back soon.
          </p>
        ) : (
          <Tabs defaultValue={defaultCategory} className="w-full">
          <div className="mb-8 w-full">
            <TabsList className="flex flex-wrap w-full bg-gray-800 border border-gray-700 rounded-lg p-1.5 gap-1.5 justify-start items-center min-h-[2.5rem] overflow-hidden">
              {categoryNames.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="text-sm text-gray-300 hover:text-white transition-all duration-200 menu-tab-trigger whitespace-nowrap flex-shrink-0"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categoryNames.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
