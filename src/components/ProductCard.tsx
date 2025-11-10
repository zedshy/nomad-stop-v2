'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCartClick = () => {
    // If product has variants, open dialog. Otherwise, add directly
    if (product.variants.length > 1) {
      // Reset to first variant when opening dialog
      setSelectedVariant(product.variants[0]);
      setIsDialogOpen(true);
    } else {
      handleAddToCart();
    }
  };

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
    setIsDialogOpen(false);
    setTimeout(() => {
      setAdded(false);
      setIsAdding(false);
    }, 2000);
  };

  // For products without variants, show the first variant's price
  const displayPrice = product.variants[0]?.price || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-white">
              {product.name}
            </h3>
            {product.popular && (
              <Badge className="bg-amber-600 text-white" style={{backgroundColor: '#FFD500'}}>
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

        {/* Price Display - Show price range if multiple variants, otherwise single price */}
        <div className="flex items-center justify-between mb-4">
          {product.variants.length > 1 ? (
            <span className="text-2xl font-bold text-amber-600" style={{color: '#FFD500'}}>
              From £{(Math.min(...product.variants.map(v => v.price)) / 100).toFixed(2)}
            </span>
          ) : (
            <span className="text-2xl font-bold text-amber-600" style={{color: '#FFD500'}}>
              £{(displayPrice / 100).toFixed(2)}
            </span>
          )}
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
                : 'bg-amber-600 hover:bg-amber-700 text-black font-semibold'
            }`}
            style={!added ? {backgroundColor: '#FFD500'} : {}}
            onClick={handleAddToCartClick}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span className="text-black">Adding...</span>
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
            <Button variant="outline" className="border-amber-600 text-black hover:bg-amber-600 hover:text-black font-semibold" style={{borderColor: '#FFD500'}}>
              Details
            </Button>
          </Link>
        </div>
      </CardContent>

      {/* Selection Dialog for products with variants */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {product.category === 'Drinks' ? 'Select Drink' : 'Select Size'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {product.category === 'Drinks' 
                ? `Choose your drink for ${product.name}`
                : `Choose your preferred size for ${product.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedVariant.id === variant.id
                      ? 'border-amber-600 bg-amber-600/20 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                  }`}
                  style={selectedVariant.id === variant.id ? {borderColor: '#FFD500', backgroundColor: 'rgba(255, 213, 0, 0.2)'} : {}}
                >
                  <div className="font-semibold text-lg mb-1">{variant.name}</div>
                  <div className="text-amber-600 font-bold" style={{color: '#FFD500'}}>
                    £{(variant.price / 100).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-amber-600 hover:bg-amber-700 text-black font-semibold"
              style={{backgroundColor: '#FFD500'}}
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
