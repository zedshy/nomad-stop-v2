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
    <main className="py-16 bg-black">
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-8 bg-gray-800 border-gray-700">
            {categoryNames.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category} 
                className="text-sm data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryNames.map((category) => (
            <TabsContent key={category} value={category}>
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
