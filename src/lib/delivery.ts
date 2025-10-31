import { config } from './config';

export interface DeliveryInfo {
  isAvailable: boolean;
  fee: number; // in pence
  freeOver: number; // in pence
  eta: string;
  message: string;
  distance?: number; // distance in miles
}

interface PostcodeCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Get postcode coordinates from Postcodes.io API
 */
export async function getPostcodeCoordinates(
  postcode: string
): Promise<PostcodeCoordinates | null> {
  try {
    const formattedPostcode = formatPostcode(postcode).replace(/\s+/g, '');
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching postcode coordinates:', error);
    return null;
  }
}

/**
 * Validate postcode using distance-based calculation with Postcodes.io
 */
export async function validatePostcode(postcode: string): Promise<DeliveryInfo> {
  // First, try to get restaurant coordinates (cache this ideally)
  const restaurantCoords = config.restaurant.coordinates;
  
  // Get customer postcode coordinates
  const customerCoords = await getPostcodeCoordinates(postcode);
  
  if (!customerCoords) {
    // Fallback to prefix-based validation if API fails
    return validatePostcodeFallback(postcode);
  }
  
  // Calculate distance
  const distance = calculateDistance(
    restaurantCoords.latitude,
    restaurantCoords.longitude,
    customerCoords.latitude,
    customerCoords.longitude
  );
  
  // Check if within delivery radius
  const isInDeliveryArea = distance <= config.delivery.radiusMiles;
  
  if (!isInDeliveryArea) {
    return {
      isAvailable: false,
      fee: 0,
      freeOver: 0,
      eta: '',
      distance,
      message: `Sorry, we don't deliver to ${postcode}. It's approximately ${distance} miles away, and we only deliver within ${config.delivery.radiusMiles} miles of the restaurant.`,
    };
  }
  
  return {
    isAvailable: true,
    fee: config.delivery.fee,
    freeOver: config.delivery.freeOver,
    eta: '25-35 minutes',
    distance,
    message: `Great! We deliver to ${postcode}. It's approximately ${distance} miles away. Delivery fee is £${(config.delivery.fee / 100).toFixed(2)}, free on orders over £${(config.delivery.freeOver / 100).toFixed(2)}.`,
  };
}

/**
 * Fallback validation using postcode prefix (for when API is unavailable)
 */
function validatePostcodeFallback(postcode: string): DeliveryInfo {
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
    message: `Great! We deliver to ${postcode}. Delivery fee is £${(config.delivery.fee / 100).toFixed(2)}, free on orders over £${config.delivery.freeOver / 100}.`,
  };
}

export function calculateDeliveryFee(subtotal: number): number {
  return subtotal >= config.delivery.freeOver ? 0 : config.delivery.fee;
}

export async function getDeliveryETA(postcode: string): Promise<string> {
  const deliveryInfo = await validatePostcode(postcode);
  
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
