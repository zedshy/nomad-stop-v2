import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

async function getPopularProducts() {
  if (DISABLE_DB) {
    return MOCK_PRODUCTS.filter((product) => product.popular).slice(0, 6);
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const products = await prisma.product.findMany({
      where: { popular: true },
      include: {
        variants: true,
      },
      take: 6,
    });
    await prisma.$disconnect();
    return products;
  } catch (error) {
    console.error('Failed to fetch popular products from database. Falling back to mock data.', error);
    return MOCK_PRODUCTS.filter((product) => product.popular).slice(0, 6);
  }
}

export default async function PopularProducts() {
  const products = await getPopularProducts();

  return (
    <section id="popular-dishes" className="py-16 bg-black pt-20 md:pt-24">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Popular Dishes
          </h2>
          <p className="text-base sm:text-lg text-gray-300">
            Customer favorites that keep them coming back
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/menu"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors" style={{backgroundColor: '#FFD500'}}
          >
            View Full Menu
          </a>
        </div>
      </div>
    </section>
  );
}
