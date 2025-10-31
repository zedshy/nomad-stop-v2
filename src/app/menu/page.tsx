import { PrismaClient } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';

const prisma = new PrismaClient();

async function getProductsByCategory() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      category: 'asc',
    },
  });

  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  return categories;
}

export default async function MenuPage() {
  const categories = await getProductsByCategory();
  const categoryNames = Object.keys(categories);

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

        <Tabs defaultValue={categoryNames[0]} className="w-full">
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
      </div>
    </main>
  );
}
