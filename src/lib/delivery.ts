import { config } from './config';

export interface DeliveryInfo {
  isAvailable: boolean;
  fee: number; // in pence
  freeOver: number; // in pence
  eta: string;
  message: string;
}

export function validatePostcode(postcode: string): DeliveryInfo {
  // Extract the first part of the postcode (e.g., "TW18" from "TW18 4PD")
  const postcodePrefix = postcode.split(' ')[0].toUpperCase();
  
  const isInDeliveryArea = config.delivery.postcodes.includes(postcodePrefix as 'TW18' | 'TW19' | 'TW15');
  
  if (!isInDeliveryArea) {
    return {
      isAvailable: false,
      fee: 0,
      freeOver: 0,
      eta: '',
      message: `Sorry, we don't deliver to ${postcode}. We currently deliver to TW18, TW19, and TW15 postcodes only.`,
    };
  }
  
  return {
    isAvailable: true,
    fee: config.delivery.fee,
    freeOver: config.delivery.freeOver,
    eta: '25-35 minutes',
    message: `Great! We deliver to ${postcode}. Delivery fee is £${(config.delivery.fee / 100).toFixed(2)}, free on orders over £${(config.delivery.freeOver / 100).toFixed(2)}.`,
  };
}

export function calculateDeliveryFee(subtotal: number): number {
  return subtotal >= config.delivery.freeOver ? 0 : config.delivery.fee;
}

export function getDeliveryETA(postcode: string): string {
  const deliveryInfo = validatePostcode(postcode);
  
  if (!deliveryInfo.isAvailable) {
    return 'Delivery not available';
  }
  
  // In a real app, this could be more sophisticated based on distance, traffic, etc.
  return '25-35 minutes';
}

export function formatPostcode(postcode: string): string {
  // Format UK postcode properly
  return postcode.toUpperCase().replace(/\s+/g, ' ').trim();
}
