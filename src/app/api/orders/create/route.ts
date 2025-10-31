import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseTimeSlot } from '@/lib/slots';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Parse time slot to get proper dates (handles today/tomorrow automatically)
    let slotStart: Date | null = null;
    let slotEnd: Date | null = null;
    
    if (orderData.slot) {
      const parsed = parseTimeSlot(orderData.slot);
      slotStart = parsed.start;
      slotEnd = parsed.end;
    }
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        status: 'payment_authorized',
        fulfilment: orderData.fulfilment,
        customerName: orderData.customer.name,
        customerPhone: orderData.customer.phone,
        customerEmail: orderData.customer.email,
        addressLine1: orderData.address?.line1 || null,
        city: orderData.address?.city || null,
        postcode: orderData.address?.postcode || null,
        slotStart,
        slotEnd,
        subtotal: orderData.total,
        deliveryFee: orderData.fulfilment === 'delivery' ? 299 : 0,
        tip: Math.round(orderData.total * (orderData.tipPercent / 100)),
        serviceFee: 0, // No service fee currently
        total: orderData.total + (orderData.fulfilment === 'delivery' ? 299 : 0) + Math.round(orderData.total * (orderData.tipPercent / 100)),
        items: {
          create: orderData.items.map((item: {id: string; name: string; price: number; quantity: number; allergens?: string}) => ({
            sku: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            allergens: item.allergens || '',
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ 
      orderId: order.id,
      status: 'success' 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
