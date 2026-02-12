'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

function buildMockCategories() {
  return MOCK_PRODUCTS.reduce<Record<string, typeof MOCK_PRODUCTS>>((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  popular: boolean;
  allergens: string;
  sortOrder: number;
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

export default function MenuPage() {
  const [categories, setCategories] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products from API
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu');
        }
        
        const products: Product[] = await response.json();
        
        // If no products returned, fall back to mock data
        if (!products || products.length === 0) {
          console.log('No products found, using mock data');
          setCategories(buildMockCategories());
          setLoading(false);
          return;
        }
        
        // Fetch categories for ordering
        const categoriesResponse = await fetch('/api/admin/categories');
        let categoryOrder: string[] = [];
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          categoryOrder = categoriesData.map((c: {name: string}) => c.name);
        }
        
        // Group products by category
        const productsByCategory = products.reduce<Record<string, Product[]>>((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
        
        // Sort categories by order
        const orderedCategories: Record<string, Product[]> = {};
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
        
        setCategories(orderedCategories);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
        setError('Failed to load menu');
        // Fallback to mock data
        setCategories(buildMockCategories());
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenu();
  }, []);

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

        {loading ? (
          <p className="text-center text-gray-300">
            Loading menu...
          </p>
        ) : error && !categoryNames.length ? (
          <p className="text-center text-gray-300">
            Menu is currently unavailable. Please check back soon.
          </p>
        ) : !categoryNames.length ? (
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
