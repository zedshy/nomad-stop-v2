'use client';

import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CartPage() {
  const { items, getSubtotal, getDeliveryFee, getTip, getDiscount, getTotal, clear, promoCode } = useCartStore();
  
  // Calculate totals - these will update when items change
  // Zustand tracks items, so when items change, this component re-renders
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tip = getTip();
  const discount = getDiscount();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <main className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Add some delicious Afghan dishes to get started!
            </p>
            <Link href="/menu">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-black font-semibold" style={{backgroundColor: '#FFD500'}}>
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">
            Your Cart
          </h1>

          {/* Delivery Info Banner */}
          <div className="mb-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg" style={{backgroundColor: 'rgba(255, 213, 0, 0.2)', borderColor: 'rgba(255, 213, 0, 0.3)'}}>
            <p className="text-sm text-amber-400" style={{color: '#FFE033'}}>
              📍 <strong>Delivery Available:</strong> We deliver to TW18, TW19, and TW15 postcodes. Free delivery on orders over £25!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="min-w-[2.5rem] flex-shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-bold text-amber-600" style={{color: '#FFD500'}}>
                              #{index + 1}
                            </span>
                            <Badge className="bg-amber-600 text-white text-xs px-2 py-0.5" style={{backgroundColor: '#FFD500'}}>
                              ×{item.quantity}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">
                                {item.name}
                              </h3>
                              {item.variant && (
                                <p className="text-sm text-gray-300">
                                  {item.variant}
                                </p>
                              )}
                              {item.addons && item.addons.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-300">Add-ons:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.addons.map((addon, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs bg-amber-600 text-white" style={{backgroundColor: '#FFD500'}}>
                                        {addon}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-amber-600 text-xl" style={{color: '#FFD500'}}>
                                £{((item.price * item.quantity) / 100).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-400">
                                  £{(item.price / 100).toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-white">
                    <span>Subtotal</span>
                    <span>£{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-white">
                      <span>Delivery Fee</span>
                      <span>£{(deliveryFee / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount {promoCode && `(${promoCode.code})`}</span>
                      <span>-£{(discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {tip > 0 && (
                    <div className="flex justify-between text-white">
                      <span>Tip</span>
                      <span>£{(tip / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between font-bold text-lg text-amber-600" style={{color: '#FFD500'}}>
                      <span>Total</span>
                      <span>£{(total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold" style={{backgroundColor: '#FFD500'}}>
                        Proceed to Checkout
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-red-600 text-black hover:bg-red-600 hover:text-black hover:border-red-600 bg-white font-semibold"
                      onClick={clear}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
