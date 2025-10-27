import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/ProductCard';

const prisma = new PrismaClient();

async function getPopularProducts() {
  return await prisma.product.findMany({
    where: { popular: true },
    include: {
      variants: true,
    },
    take: 6,
  });
}

export default async function PopularProducts() {
  const products = await getPopularProducts();

  return (
    <section id="popular-dishes" className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Popular Dishes
          </h2>
          <p className="text-lg text-gray-300">
            Customer favorites that keep them coming back
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/menu"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Full Menu
          </a>
        </div>
      </div>
    </section>
  );
}
