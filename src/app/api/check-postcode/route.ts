import { NextRequest, NextResponse } from 'next/server';
import { validatePostcode } from '@/lib/delivery';

export async function POST(request: NextRequest) {
  try {
    const { postcode } = await request.json();
    
    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      );
    }

    // Use the new distance-based validation with Postcodes.io
    const deliveryInfo = await validatePostcode(postcode);
    
    if (!deliveryInfo.isAvailable) {
      return NextResponse.json({
        available: false,
        message: deliveryInfo.message,
        distance: deliveryInfo.distance,
      });
    }

    return NextResponse.json({
      available: true,
      postcode: postcode,
      message: deliveryInfo.message,
      distance: deliveryInfo.distance,
      deliveryFee: deliveryInfo.fee,
      freeOver: deliveryInfo.freeOver,
      eta: deliveryInfo.eta,
    });

  } catch (error) {
    console.error('Postcode check error:', error);
    return NextResponse.json(
      { error: 'Failed to check postcode' },
      { status: 500 }
    );
  }
}


