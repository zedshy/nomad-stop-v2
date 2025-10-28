import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createAuthorization } from '@/lib/worldpay';
import { calculatePricing } from '@/lib/pricing';

const prisma = new PrismaClient();

const CreateIntentSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    variant: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    addons: z.array(z.string()).optional(),
    allergens: z.string().optional(),
  })),
  fulfilment: z.enum(['pickup', 'delivery']),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  }),
  address: z.object({
    line1: z.string(),
    city: z.string(),
    postcode: z.string(),
  }).optional(),
  slot: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  tipPercent: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateIntentSchema.parse(body);

    // Calculate pricing
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const pricing = calculatePricing(
      subtotal,
      validatedData.fulfilment,
      validatedData.tipPercent
    );

    // Create order in database
    const order = await prisma.order.create({
      data: {
        status: 'payment_authorized',
        fulfilment: validatedData.fulfilment,
        slotStart: validatedData.slot ? new Date(validatedData.slot.start) : null,
        slotEnd: validatedData.slot ? new Date(validatedData.slot.end) : null,
        customerName: validatedData.customer.name,
        customerPhone: validatedData.customer.phone,
        customerEmail: validatedData.customer.email,
        addressLine1: validatedData.address?.line1,
        city: validatedData.address?.city,
        postcode: validatedData.address?.postcode,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        tip: pricing.tip,
        serviceFee: pricing.serviceFee,
        total: pricing.total,
        currency: 'GBP',
        items: {
          create: validatedData.items.map(item => ({
            sku: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            addons: item.addons || [],
            allergens: item.allergens || '',
          })),
        },
      },
    });

    // Create Worldpay authorization
    const worldpayResponse = await createAuthorization({
      amount: pricing.total,
      currency: 'GBP',
      customer: validatedData.customer,
      meta: {
        orderId: order.id,
        fulfilment: validatedData.fulfilment,
        slot: validatedData.slot ? `${validatedData.slot.start}-${validatedData.slot.end}` : undefined,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: 'worldpay',
        status: 'authorized',
        worldpayRef: worldpayResponse.worldpayRef,
        amount: pricing.total,
        currency: 'GBP',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      worldpayRef: worldpayResponse.worldpayRef,
      total: pricing.total,
    });

  } catch (error) {
    console.error('Create intent error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
