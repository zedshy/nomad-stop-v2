import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        fulfilment: orderData.fulfilment,
        customerName: orderData.customer.name,
        customerPhone: orderData.customer.phone,
        customerEmail: orderData.customer.email,
        addressLine1: orderData.address?.line1 || null,
        city: orderData.address?.city || null,
        postcode: orderData.address?.postcode || null,
        slotStart: orderData.slot ? new Date(`2024-01-01T${orderData.slot.split('-')[0]}:00`) : null,
        slotEnd: orderData.slot ? new Date(`2024-01-01T${orderData.slot.split('-')[1]}:00`) : null,
        subtotal: orderData.total,
        deliveryFee: orderData.fulfilment === 'delivery' ? 299 : 0,
        tip: Math.round(orderData.total * (orderData.tipPercent / 100)),
        serviceFee: 0, // No service fee currently
        total: orderData.total + (orderData.fulfilment === 'delivery' ? 299 : 0) + Math.round(orderData.total * (orderData.tipPercent / 100)),
        items: {
          create: orderData.items.map((item: any) => ({
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
