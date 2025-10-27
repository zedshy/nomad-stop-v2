import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { postcode } = await request.json();
    
    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    // Extract the first part of the postcode (e.g., "TW18" from "TW18 4PD")
    const postcodePrefix = postcode.split(' ')[0].toUpperCase();
    
    // Valid delivery postcodes
    const validPostcodes = ['TW18', 'TW19', 'TW15'];
    const isAvailable = validPostcodes.includes(postcodePrefix);
    
    if (!isAvailable) {
      return NextResponse.json({
        available: false,
        message: `Sorry, we don't deliver to ${postcodePrefix}. We currently deliver to TW18, TW19, and TW15 postcodes only.`
      });
    }

    return NextResponse.json({
      available: true,
      postcode: postcodePrefix,
      message: `Great! We deliver to ${postcodePrefix}. Delivery fee is £2.99, free on orders over £25.`,
      deliveryFee: 299,
      freeOver: 2500
    });

  } catch (error) {
    console.error('Postcode check error:', error);
    return NextResponse.json(
      { error: 'Failed to check postcode' },
      { status: 500 }
    );
  }
}


