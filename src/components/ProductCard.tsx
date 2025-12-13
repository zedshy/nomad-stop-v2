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
import { useState, useEffect } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    popular: boolean;
    allergens: string;
    imageUrl?: string | null;
    isMeal?: boolean;
    mealDrinkCategory?: string | null;
    variants: {
      id: string;
      name: string;
      price: number;
      bases?: string[] | null;
      toppings?: Array<{name: string; price: number}> | null;
    }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'size' | 'pizza' | 'drink'>('size');
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<Array<{name: string; price: number}>>([]);
  const [selectedDrink, setSelectedDrink] = useState<{id: string; name: string; price: number} | null>(null);
  const [availableDrinks, setAvailableDrinks] = useState<Array<{id: string; name: string; price: number}>>([]);
  
  type VariantType = typeof product.variants[0];

  // Fetch drinks when meal is selected
  useEffect(() => {
    if (product.isMeal && product.mealDrinkCategory && dialogStep === 'drink') {
      fetch(`/api/menu?category=${encodeURIComponent(product.mealDrinkCategory)}`)
        .then(res => res.json())
        .then(data => {
          const drinks = Array.isArray(data) ? data : [];
          setAvailableDrinks(drinks.flatMap((p: {id: string; variants?: Array<{id: string; name: string; price: number}>}) => 
            p.variants?.map((v) => ({
              id: `${p.id}-${v.id}`,
              name: `${p.name} - ${v.name}`,
              price: v.price,
            })) || []
          ));
        })
        .catch(() => setAvailableDrinks([]));
    }
  }, [product.isMeal, product.mealDrinkCategory, dialogStep]);

  const handleAddToCartClick = () => {
    // Reset all selections
    setSelectedVariant(product.variants[0]);
    setSelectedBase('');
    setSelectedToppings([]);
    setSelectedDrink(null);
    setDialogStep('size');
    
    // If product has variants, pizza customization, or is a meal, open dialog
    if (product.variants.length > 1 || (product.category === 'Pizza' && selectedVariant.bases) || product.isMeal) {
      setIsDialogOpen(true);
    } else {
      handleAddToCart();
    }
  };

  const handleSizeSelected = (variant: VariantType) => {
    setSelectedVariant(variant);
    // If pizza with bases, go to pizza step, else if meal, go to drink step, else add to cart
    if (product.category === 'Pizza' && variant.bases) {
      setDialogStep('pizza');
    } else if (product.isMeal) {
      setDialogStep('drink');
    } else {
      handleAddToCart();
    }
  };

  const handlePizzaNext = () => {
    if (product.isMeal) {
      setDialogStep('drink');
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Calculate total price with toppings and drink
    let totalPrice = selectedVariant.price;
    selectedToppings.forEach(topping => {
      totalPrice += Math.round(topping.price * 100); // Convert to pence
    });
    if (selectedDrink) {
      totalPrice += selectedDrink.price;
    }

    // Build item name with customizations
    let itemName = product.name;
    if (selectedVariant.name !== 'Standard') {
      itemName += ` - ${selectedVariant.name}`;
    }
    if (selectedBase) {
      itemName += ` (${selectedBase})`;
    }
    if (selectedToppings.length > 0) {
      itemName += ` + ${selectedToppings.map(t => t.name).join(', ')}`;
    }
    if (selectedDrink) {
      itemName += ` + ${selectedDrink.name}`;
    }
    
    addItem({
      id: product.id,
      name: itemName,
      variant: selectedVariant.name,
      price: totalPrice,
      allergens: product.allergens,
    });

    setAdded(true);
    setIsDialogOpen(false);
    setTimeout(() => {
      setAdded(false);
      setIsAdding(false);
      // Reset selections
      setSelectedBase('');
      setSelectedToppings([]);
      setSelectedDrink(null);
      setDialogStep('size');
    }, 2000);
  };

  // For products without variants, show the first variant's price
  const displayPrice = product.variants[0]?.price || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
      <CardContent className="p-3.5 md:p-6">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-700">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Title and Popular badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/menu#${product.slug}`} className="flex-1 min-w-0">
            <h3 className="text-sm md:text-xl font-semibold text-white leading-snug hover:text-amber-600 transition-colors cursor-pointer line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.popular && (
            <Badge className="bg-amber-600 text-white text-[10px] md:text-xs px-2 py-0.5 flex-shrink-0" style={{backgroundColor: '#FFD500'}}>
              Hot
            </Badge>
          )}
        </div>

        {/* Price - prominent */}
        <div className="mb-3">
          {product.variants.length > 1 ? (
            <div>
              <div className="text-xl md:text-2xl font-bold text-amber-600" style={{color: '#FFD500'}}>
                From £{(Math.min(...product.variants.map(v => v.price)) / 100).toFixed(2)}
              </div>
              {/* Show size options for pizzas */}
              {product.category === 'Pizza' && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {product.variants.map((variant) => (
                    <span
                      key={variant.id}
                      className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 border border-gray-600"
                    >
                      {variant.name} £{(variant.price / 100).toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xl md:text-2xl font-bold text-amber-600" style={{color: '#FFD500'}}>
              £{(displayPrice / 100).toFixed(2)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] md:text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Category and Allergens */}
        <div className="space-y-1 mb-4">
          <p className="text-[10px] md:text-sm text-gray-400">
            {product.category}
          </p>
          {product.allergens && (
            <p className="text-[10px] md:text-sm text-gray-400">
              {product.allergens}
            </p>
          )}
        </div>

        {/* Action buttons - only Add to Cart */}
        <Button 
          className={`w-full transition-all duration-300 text-sm md:text-base py-2.5 md:py-3 ${
            added 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-amber-600 hover:bg-amber-700 text-black font-semibold'
          }`}
          style={!added ? {backgroundColor: '#FFD500'} : {}}
          onClick={handleAddToCartClick}
          disabled={isAdding}
        >
          {isAdding ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span className="text-black">Adding...</span>
            </div>
          ) : added ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </div>
          )}
        </Button>
      </CardContent>

      {/* Selection Dialog for products with variants */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {dialogStep === 'size' && (product.category === 'Drinks' ? 'Select Drink' : 'Select Size')}
              {dialogStep === 'pizza' && 'Customize Your Pizza'}
              {dialogStep === 'drink' && 'Choose Your Drink'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {dialogStep === 'size' && (product.category === 'Drinks' 
                ? `Choose your drink for ${product.name}`
                : `Choose your preferred size for ${product.name}`)}
              {dialogStep === 'pizza' && 'Select base and extra toppings'}
              {dialogStep === 'drink' && 'Choose a drink to complete your meal'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Size Selection Step */}
            {dialogStep === 'size' && (
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSizeSelected(variant)}
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
            )}

            {/* Pizza Customization Step */}
            {dialogStep === 'pizza' && selectedVariant.bases && (
              <div className="space-y-4">
                {/* Base Selection */}
                <div>
                  <Label className="text-white mb-2 block">Pizza Base</Label>
                  <Select value={selectedBase} onValueChange={setSelectedBase}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select base" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {(Array.isArray(selectedVariant.bases) ? selectedVariant.bases : []).map((base, idx) => (
                        <SelectItem key={idx} value={base} className="text-white">
                          {base}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toppings Selection */}
                {selectedVariant.toppings && Array.isArray(selectedVariant.toppings) && selectedVariant.toppings.length > 0 && (
                  <div>
                    <Label className="text-white mb-2 block">Extra Toppings (Optional)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedVariant.toppings.map((topping, idx) => {
                        const isSelected = selectedToppings.some(t => t.name === topping.name);
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name));
                              } else {
                                setSelectedToppings([...selectedToppings, {name: topping.name, price: topping.price || 0}]);
                              }
                            }}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-amber-600 bg-amber-600/20'
                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-white">{topping.name}</span>
                              <span className="text-amber-600 font-semibold" style={{color: '#FFD500'}}>
                                +£{((topping.price || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Drink Selection Step */}
            {dialogStep === 'drink' && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableDrinks.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Loading drinks...</p>
                ) : (
                  availableDrinks.map((drink) => (
                    <button
                      key={drink.id}
                      onClick={() => setSelectedDrink(drink)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedDrink?.id === drink.id
                          ? 'border-amber-600 bg-amber-600/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white">{drink.name}</span>
                        <span className="text-amber-600 font-semibold" style={{color: '#FFD500'}}>
                          £{(drink.price / 100).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (dialogStep === 'pizza') {
                  setDialogStep('size');
                } else if (dialogStep === 'drink') {
                  if (product.category === 'Pizza' && selectedVariant.bases) {
                    setDialogStep('pizza');
                  } else {
                    setDialogStep('size');
                  }
                } else {
                  setIsDialogOpen(false);
                }
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {dialogStep === 'size' ? 'Cancel' : 'Back'}
            </Button>
            {dialogStep === 'pizza' && (
              <Button
                onClick={handlePizzaNext}
                disabled={!selectedBase}
                className="bg-amber-600 hover:bg-amber-700 text-black font-semibold disabled:opacity-50"
                style={{backgroundColor: '#FFD500'}}
              >
                {product.isMeal ? 'Next: Choose Drink' : 'Add to Cart'}
              </Button>
            )}
            {(dialogStep === 'size' || dialogStep === 'drink') && (
              <Button
                onClick={handleAddToCart}
                disabled={dialogStep === 'drink' && !selectedDrink}
                className="bg-amber-600 hover:bg-amber-700 text-black font-semibold disabled:opacity-50"
                style={{backgroundColor: '#FFD500'}}
              >
                Add to Cart
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
