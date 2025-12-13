'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  popular: boolean;
  allergens: string;
  imageUrl: string | null;
  isMeal: boolean;
  mealDrinkCategory: string | null;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    bases?: string[] | null;
    toppings?: Array<{name: string; price: number}> | null;
  }>;
  addons?: Array<{ id: string; name: string; price: number; isRequired?: boolean }>;
}

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularProducts() {
      try {
        setLoading(true);
        // Fetch all products and filter for popular ones
        const response = await fetch('/api/menu');
        if (response.ok) {
          const allProducts: Product[] = await response.json();
          const popular = allProducts.filter(p => p.popular).slice(0, 6);
          setProducts(popular);
        } else {
          // Fallback to mock data
          setProducts(MOCK_PRODUCTS.filter((product) => product.popular).slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
        // Fallback to mock data
        setProducts(MOCK_PRODUCTS.filter((product) => product.popular).slice(0, 6));
      } finally {
        setLoading(false);
      }
    }
    
    fetchPopularProducts();
  }, []);

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

        {loading ? (
          <div className="text-center text-gray-300 py-8">
            Loading popular dishes...
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

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
