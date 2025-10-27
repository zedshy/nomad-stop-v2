'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    popular: boolean;
    allergens: string;
    variants: {
      id: string;
      name: string;
      price: number;
    }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const priceRange = minPrice === maxPrice 
    ? `£${(minPrice / 100).toFixed(2)}`
    : `£${(minPrice / 100).toFixed(2)} - £${(maxPrice / 100).toFixed(2)}`;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    addItem({
      id: product.id,
      name: product.name,
      variant: selectedVariant.name,
      price: selectedVariant.price,
      allergens: product.allergens,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsAdding(false);
    }, 2000);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-white">
              {product.name}
            </h3>
            {product.popular && (
              <Badge className="bg-yellow-600 text-white">
                Popular
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-2">
            {product.description}
          </p>
          <p className="text-sm text-gray-400">
            {product.category}
          </p>
        </div>

        {/* Variant Selector for products with multiple variants */}
        {product.variants.length > 1 && (
          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-2 block">Size:</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedVariant.id === variant.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-yellow-600">
            £{(selectedVariant.price / 100).toFixed(2)}
          </span>
          {product.allergens && (
            <span className="text-xs text-gray-400">
              {product.allergens}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            className={`flex-1 transition-all duration-300 ${
              added 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : added ? (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Added!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </div>
            )}
          </Button>
          <Link href={`/menu#${product.slug}`}>
            <Button variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
