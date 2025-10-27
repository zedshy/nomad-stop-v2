'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    fulfilment: 'pickup' as 'pickup' | 'delivery',
    addressLine1: '',
    city: '',
    postcode: '',
    slot: '',
    tipPercent: 0,
  });

  const { items, subtotal, deliveryFee, tip, total, setCustomer, setAddress, setSlot, setTipPercent, setFulfilment } = useCartStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && formData.phone.trim() !== '';
      case 2:
        if (formData.fulfilment === 'delivery') {
          return formData.addressLine1.trim() !== '' && 
                 formData.city.trim() !== '' && 
                 formData.postcode.trim() !== '' &&
                 validatePostcode(formData.postcode);
        }
        return true;
      case 3:
        return formData.slot !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const validatePostcode = (postcode: string) => {
    const validPostcodes = ['TW18', 'TW19', 'TW15'];
    const postcodePrefix = postcode.toUpperCase().substring(0, 4);
    return validPostcodes.includes(postcodePrefix);
  };

  const handleNext = () => {
    if (validateStep(step)) {
      // Save data to cart store
      if (step === 1) {
        setCustomer({ name: formData.name, phone: formData.phone, email: formData.email });
      } else if (step === 2) {
        setFulfilment(formData.fulfilment);
        if (formData.fulfilment === 'delivery') {
          setAddress({ 
            line1: formData.addressLine1, 
            city: formData.city, 
            postcode: formData.postcode 
          });
        }
      } else if (step === 3) {
        setSlot({ start: formData.slot.split('-')[0], end: formData.slot.split('-')[1] });
      } else if (step === 4) {
        setTipPercent(Number(formData.tipPercent));
      }
      
      if (step < 4) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save final data
      setTipPercent(Number(formData.tipPercent));
      
      // Create order
      const orderData = {
        items,
        customer: { name: formData.name, phone: formData.phone, email: formData.email },
        fulfilment: formData.fulfilment,
        address: formData.fulfilment === 'delivery' ? {
          line1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode
        } : null,
        slot: formData.slot,
        tipPercent: Number(formData.tipPercent),
        total
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const { orderId } = await response.json();
        router.push(`/order/pending?oid=${orderId}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Add some items to your cart before checking out.
            </p>
            <a href="/menu">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Browse Menu
              </Button>
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNumber
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-yellow-600' : 'bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {step === 1 && 'Contact Information'}
                    {step === 2 && 'Delivery Method'}
                    {step === 3 && 'Time Slot'}
                    {step === 4 && 'Payment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Contact Information */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Delivery Method */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <RadioGroup
                        value={formData.fulfilment}
                        onValueChange={(value) => handleInputChange('fulfilment', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <Label htmlFor="pickup" className="text-white">Pickup</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id="delivery" />
                          <Label htmlFor="delivery" className="text-white">Delivery</Label>
                        </div>
                      </RadioGroup>

                      {formData.fulfilment === 'delivery' && (
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="addressLine1" className="text-white">Address Line 1 *</Label>
                            <Input
                              id="addressLine1"
                              value={formData.addressLine1}
                              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="city" className="text-white">City *</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="postcode" className="text-white">Postcode *</Label>
                            <Input
                              id="postcode"
                              value={formData.postcode}
                              onChange={(e) => handleInputChange('postcode', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="TW18, TW19, or TW15"
                              required
                            />
                            {formData.postcode && !validatePostcode(formData.postcode) && (
                              <p className="text-red-400 text-sm mt-1">
                                We only deliver to TW18, TW19, and TW15 postcodes
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Time Slot */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <Label className="text-white">Select Time Slot</Label>
                      <Select value={formData.slot} onValueChange={(value) => handleInputChange('slot', value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="12:00-12:15" className="text-white">12:00 - 12:15</SelectItem>
                          <SelectItem value="12:15-12:30" className="text-white">12:15 - 12:30</SelectItem>
                          <SelectItem value="12:30-12:45" className="text-white">12:30 - 12:45</SelectItem>
                          <SelectItem value="12:45-13:00" className="text-white">12:45 - 13:00</SelectItem>
                          <SelectItem value="13:00-13:15" className="text-white">13:00 - 13:15</SelectItem>
                          <SelectItem value="13:15-13:30" className="text-white">13:15 - 13:30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Step 4: Payment */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Tip Amount</Label>
                        <Select value={formData.tipPercent.toString()} onValueChange={(value) => handleInputChange('tipPercent', value)}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select tip amount" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="0" className="text-white">No tip</SelectItem>
                            <SelectItem value="5" className="text-white">5%</SelectItem>
                            <SelectItem value="10" className="text-white">10%</SelectItem>
                            <SelectItem value="12.5" className="text-white">12.5%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-300">
                          Payment will be processed securely through Worldpay.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back
                    </Button>
                    {step < 4 ? (
                      <Button 
                        onClick={handleNext}
                        disabled={!validateStep(step)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-gray-600"
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-white">
                      <span>{item.name} x{item.quantity}</span>
                      <span>£{(item.price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-4 space-y-2">
                    <div className="flex justify-between text-white">
                      <span>Subtotal</span>
                      <span>£{(subtotal / 100).toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-white">
                        <span>Delivery</span>
                        <span>£{(deliveryFee / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between text-white">
                        <span>Tip</span>
                        <span>£{(tip / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-yellow-600">
                      <span>Total</span>
                      <span>£{(total / 100).toFixed(2)}</span>
                    </div>
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
