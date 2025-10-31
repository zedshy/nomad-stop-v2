'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { generateTimeSlots } from '@/lib/slots';

interface PostcodeValidation {
  isValid: boolean | null; // null = not checked yet, true = valid, false = invalid
  isLoading: boolean;
  message: string;
  distance?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postcodeValidation, setPostcodeValidation] = useState<PostcodeValidation>({
    isValid: null,
    isLoading: false,
    message: '',
  });
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
    promoCode: '',
  });

  const [promoCodeValidation, setPromoCodeValidation] = useState<{
    isValid: boolean | null;
    isLoading: boolean;
    message: string;
    discount: number;
  }>({
    isValid: null,
    isLoading: false,
    message: '',
    discount: 0,
  });

  const { items, getSubtotal, getDeliveryFee, getTip, getDiscount, getTotal, setCustomer, setAddress, setSlot, setTipPercent, setFulfilment, setPromoCode, promoCode, clear, tipPercent, fulfilment } = useCartStore();
  
  // Calculate totals - Zustand tracks items, tipPercent, fulfilment, and promoCode
  // When these change, the component re-renders and totals are recalculated
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tip = getTip();
  const discount = getDiscount();
  const total = getTotal();

  // Load promo code from store if it exists
  useEffect(() => {
    if (promoCode && !formData.promoCode) {
      setFormData(prev => ({ ...prev, promoCode: promoCode.code }));
      setPromoCodeValidation({
        isValid: true,
        isLoading: false,
        message: 'Promo code applied',
        discount: promoCode.discount,
      });
    }
  }, [promoCode]);
  const [slotRefreshKey, setSlotRefreshKey] = useState(0);
  
  // Generate time slots dynamically based on current time
  // Regenerate when step changes to 3 or when explicitly refreshed
  const timeSlots = useMemo(() => {
    if (step === 3) {
      return generateTimeSlots().filter(slot => slot.available);
    }
    return [];
  }, [step, slotRefreshKey]);
  
  // Refresh slots when entering step 3
  useEffect(() => {
    if (step === 3) {
      setSlotRefreshKey(prev => prev + 1);
    }
  }, [step]);

  // Check postcode when it changes (only for delivery)
  useEffect(() => {
    if (formData.fulfilment === 'delivery' && formData.postcode.trim()) {
      const checkPostcode = async () => {
        const postcode = formData.postcode.trim();
        // Only check if postcode looks valid (at least 5 characters)
        if (postcode.length >= 5) {
          setPostcodeValidation({ isValid: null, isLoading: true, message: '' });
          
          try {
            const response = await fetch('/api/check-postcode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ postcode }),
            });
            
            const data = await response.json();
            
            if (data.available) {
              setPostcodeValidation({
                isValid: true,
                isLoading: false,
                message: data.message,
                distance: data.distance,
              });
            } else {
              setPostcodeValidation({
                isValid: false,
                isLoading: false,
                message: data.message,
                distance: data.distance,
              });
            }
          } catch (error) {
            console.error('Postcode check error:', error);
            setPostcodeValidation({
              isValid: false,
              isLoading: false,
              message: 'Unable to verify postcode. Please try again.',
            });
          }
        } else {
          // Reset validation if postcode is too short
          setPostcodeValidation({ isValid: null, isLoading: false, message: '' });
        }
      };

      // Debounce the API call
      const timeoutId = setTimeout(checkPostcode, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // Reset validation when switching to pickup or clearing postcode
      setPostcodeValidation({ isValid: null, isLoading: false, message: '' });
    }
  }, [formData.postcode, formData.fulfilment]);

  // Validate promo code when it changes
  useEffect(() => {
    if (formData.promoCode.trim()) {
      const validatePromoCode = async () => {
        const code = formData.promoCode.trim().toUpperCase();
        setPromoCodeValidation({ isValid: null, isLoading: true, message: '', discount: 0 });
        
        try {
          const response = await fetch('/api/promo-code/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, subtotal }),
          });

          const data = await response.json();

          if (data.valid) {
            setPromoCodeValidation({
              isValid: true,
              isLoading: false,
              message: data.message,
              discount: data.discount,
            });
            setPromoCode({ code: data.promoCode.code, discount: data.discount });
          } else {
            setPromoCodeValidation({
              isValid: false,
              isLoading: false,
              message: data.message,
              discount: 0,
            });
            setPromoCode(null);
          }
        } catch (error) {
          console.error('Promo code validation error:', error);
          setPromoCodeValidation({
            isValid: false,
            isLoading: false,
            message: 'Unable to validate promo code. Please try again.',
            discount: 0,
          });
          setPromoCode(null);
        }
      };

      const timeoutId = setTimeout(validatePromoCode, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setPromoCodeValidation({ isValid: null, isLoading: false, message: '', discount: 0 });
      setPromoCode(null);
    }
  }, [formData.promoCode, subtotal, setPromoCode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '' && 
               formData.phone.trim() !== '' && 
               formData.email.trim() !== '' &&
               isValidEmail(formData.email);
      case 2:
        if (formData.fulfilment === 'delivery') {
          return formData.addressLine1.trim() !== '' && 
                 formData.city.trim() !== '' && 
                 formData.postcode.trim() !== '' &&
                 postcodeValidation.isValid === true; // Must be validated and valid
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
        promoCode: promoCode ? promoCode.code : null,
        total
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const { orderId } = await response.json();
        // Clear the cart after successful order submission
        clear();
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
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-black font-semibold" style={{backgroundColor: '#FFD500'}}>
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
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                    style={step >= stepNumber ? {backgroundColor: '#FFD500'} : {}}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-amber-600' : 'bg-gray-700'}`} style={step > stepNumber ? {backgroundColor: '#FFD500'} : {}} />
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
                        <Label htmlFor="email" className="text-white">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`bg-gray-700 border-gray-600 text-white ${
                            formData.email && !isValidEmail(formData.email) ? 'border-red-500' : ''
                          }`}
                          placeholder="your.email@example.com"
                          required
                        />
                        {formData.email && !isValidEmail(formData.email) && (
                          <p className="text-red-400 text-sm mt-1">
                            Please enter a valid email address
                          </p>
                        )}
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
                              className={`bg-gray-700 border-gray-600 text-white ${
                                postcodeValidation.isValid === false ? 'border-red-500' : 
                                postcodeValidation.isValid === true ? 'border-green-500' : ''
                              }`}
                              placeholder="Enter your postcode"
                              required
                            />
                            {postcodeValidation.isLoading && (
                              <p className="text-amber-400 text-sm mt-1 flex items-center gap-2" style={{color: '#FFE033'}}>
                                <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" style={{borderColor: '#FFE033'}}></span>
                                Checking postcode...
                              </p>
                            )}
                            {postcodeValidation.isValid === true && postcodeValidation.message && (
                              <p className="text-green-400 text-sm mt-1">
                                ✓ {postcodeValidation.message}
                              </p>
                            )}
                            {postcodeValidation.isValid === false && postcodeValidation.message && (
                              <p className="text-red-400 text-sm mt-1">
                                ✗ {postcodeValidation.message}
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
                      {timeSlots.length === 0 ? (
                        <p className="text-amber-400 text-sm" style={{color: '#FFE033'}}>
                          No time slots available at the moment. Please try again later.
                        </p>
                      ) : (
                        <Select value={formData.slot} onValueChange={(value) => handleInputChange('slot', value)}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Choose a time slot" />
                          </SelectTrigger>
                          <SelectContent 
                            className="bg-gray-800 border-gray-600 max-h-[300px]"
                          >
                            {timeSlots.map((slot) => {
                              const slotValue = `${slot.start}-${slot.end}`;
                              return (
                                <SelectItem 
                                  key={slotValue} 
                                  value={slotValue} 
                                  className="text-white"
                                  disabled={!slot.available}
                                >
                                  {slot.start} - {slot.end}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {/* Step 4: Payment */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="promoCode" className="text-white">Promo Code (Optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="promoCode"
                            value={formData.promoCode}
                            onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                            className={`bg-gray-700 border-gray-600 text-white ${
                              promoCodeValidation.isValid === false ? 'border-red-500' : 
                              promoCodeValidation.isValid === true ? 'border-green-500' : ''
                            }`}
                            placeholder="Enter promo code (e.g., TEST2024)"
                          />
                          {promoCodeValidation.isValid && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, promoCode: '' }));
                                setPromoCode(null);
                                setPromoCodeValidation({ isValid: null, isLoading: false, message: '', discount: 0 });
                              }}
                              className="border-gray-600 text-black bg-white hover:bg-gray-700 hover:text-black font-semibold"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {promoCodeValidation.isLoading && (
                          <p className="text-sm text-gray-400 mt-2">
                            Validating promo code...
                          </p>
                        )}
                        {promoCodeValidation.isValid === true && promoCodeValidation.message && (
                          <p className="text-sm text-green-400 mt-2">
                            ✓ {promoCodeValidation.message} - £{(promoCodeValidation.discount / 100).toFixed(2)} discount applied
                          </p>
                        )}
                        {promoCodeValidation.isValid === false && promoCodeValidation.message && (
                          <p className="text-sm text-red-400 mt-2">
                            ✗ {promoCodeValidation.message}
                          </p>
                        )}
                      </div>
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
                      className="border-gray-600 text-black hover:bg-gray-700 hover:text-black bg-white font-semibold"
                    >
                      Back
                    </Button>
                    {step < 4 ? (
                      <Button 
                        onClick={handleNext}
                        disabled={!validateStep(step)}
                        className="bg-amber-600 hover:bg-amber-700 text-black font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-white"
                        style={{backgroundColor: '#FFD500'}}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="bg-amber-600 hover:bg-amber-700 text-black font-semibold disabled:bg-gray-600 disabled:text-white"
                        style={{backgroundColor: '#FFD500'}}
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
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-£{(discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div className="flex justify-between text-white">
                        <span>Tip</span>
                        <span>£{(tip / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-amber-600" style={{color: '#FFD500'}}>
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
