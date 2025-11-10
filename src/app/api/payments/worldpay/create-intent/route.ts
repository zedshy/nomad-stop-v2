import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createAuthorization } from '@/lib/worldpay';
import { calculatePricing } from '@/lib/pricing';
import { parseTimeSlot } from '@/lib/slots';

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
         }).nullable().optional(),
  slot: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  tipPercent: z.number(),
  card: z.object({
    number: z.string().min(12, 'Card number is required'),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be in MM/YY format'),
    cvc: z.string().regex(/^[0-9]{3,4}$/, 'CVC must be 3 or 4 digits'),
    name: z.string().min(1, 'Cardholder name is required'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', message: 'Failed to parse request body' },
        { status: 400 }
      );
    }
    
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

    // Parse time slot to get proper dates (handles today/tomorrow automatically)
    let slotStart: Date | null = null;
    let slotEnd: Date | null = null;
    
    if (validatedData.slot) {
      const slotString = `${validatedData.slot.start}-${validatedData.slot.end}`;
      const parsed = parseTimeSlot(slotString);
      slotStart = parsed.start;
      slotEnd = parsed.end;
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        status: 'payment_authorized',
        fulfilment: validatedData.fulfilment,
        slotStart,
        slotEnd,
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
    let worldpayResponse;
    try {
      worldpayResponse = await Promise.race([
        createAuthorization({
          amount: pricing.total,
          currency: 'GBP',
          customer: validatedData.customer,
          meta: {
            orderId: order.id,
            fulfilment: validatedData.fulfilment,
            slot: validatedData.slot ? `${validatedData.slot.start}-${validatedData.slot.end}` : undefined,
          },
          card: validatedData.card,
        }),
        // Add a 25 second timeout as a backup (Worldpay has 10s, but this is a safety net)
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Worldpay authorization timeout')), 25000)
        )
      ]) as any;
      
      // Validate Worldpay response structure
      if (!worldpayResponse || !worldpayResponse.worldpayRef) {
        throw new Error('Invalid response from Worldpay: missing worldpayRef');
      }
    } catch (worldpayError: any) {
      console.error('Worldpay authorization error:', {
        name: worldpayError?.name,
        message: worldpayError?.message,
        error: worldpayError
      });
      // If Worldpay fails, we should not create the order - delete it
      try {
        await prisma.order.delete({ where: { id: order.id } });
      } catch (deleteError) {
        console.error('Error deleting order after Worldpay failure:', deleteError);
        // Ignore delete errors - continue with error response
      }
      // Return error response instead of throwing
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma after Worldpay error:', disconnectError);
      }
      return NextResponse.json(
        { 
          error: 'Worldpay payment authorization failed', 
          message: worldpayError?.message || 'Payment processing failed. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Create payment record
    try {
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
    } catch (paymentError) {
      console.error('Error creating payment record:', paymentError);
      // If payment record creation fails, try to delete the order
      try {
        await prisma.order.delete({ where: { id: order.id } });
      } catch (deleteError) {
        console.error('Error deleting order after payment creation failure:', deleteError);
      }
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma:', disconnectError);
      }
      return NextResponse.json(
        { error: 'Failed to create payment record', message: 'Payment processing failed' },
        { status: 500 }
      );
    }

    // Disconnect Prisma before returning success
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }

    return NextResponse.json({
      orderId: order.id,
      worldpayRef: worldpayResponse.worldpayRef,
      total: pricing.total,
    });

  } catch (error: any) {
    console.error('Create intent error:', error);
    
    // Ensure Prisma is disconnected even on error
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues, message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
        { status: 400 }
      );
    }

    // Get the actual error message
    let errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error occurred');
    
    // If the error message is too generic like "fetch failed", provide more context
    if (errorMessage === 'fetch failed' || errorMessage.includes('fetch failed')) {
      errorMessage = 'Payment processing service is temporarily unavailable. Please try again in a moment.';
    }
    
    // If error message is empty or too generic, provide a default
    if (!errorMessage || errorMessage === 'Unknown error occurred') {
      errorMessage = 'An unexpected error occurred while processing your payment. Please try again or contact support.';
    }
    
    console.error('Error details:', {
      message: errorMessage,
      name: error?.name,
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Always return a response, never throw
    return NextResponse.json(
      { error: 'Failed to create payment intent', message: errorMessage },
      { status: 500 }
    );
  }
}
