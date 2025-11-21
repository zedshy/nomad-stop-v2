import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthorization, WorldpayResponse, capture } from '@/lib/worldpay';
import { calculatePricing } from '@/lib/pricing';
import { parseTimeSlot } from '@/lib/slots';
import { sendOrderConfirmationEmail } from '@/lib/email';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

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
  let prisma: import('@prisma/client').PrismaClient | null = null;
  let orderId: string | null = null;

  try {
    let body: unknown;
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

    if (!DISABLE_DB) {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    }

    if (!DISABLE_DB && prisma) {
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
      orderId = order.id;
    } else {
      orderId = `mock-order-${Date.now()}`;
    }

    // Create Worldpay authorization
    let worldpayResponse: WorldpayResponse;
    try {
      worldpayResponse = await Promise.race<WorldpayResponse>([
        createAuthorization({
          amount: pricing.total,
          currency: 'GBP',
          customer: validatedData.customer,
          meta: {
            orderId: orderId ?? '',
            fulfilment: validatedData.fulfilment,
            slot: validatedData.slot ? `${validatedData.slot.start}-${validatedData.slot.end}` : undefined,
          },
          card: validatedData.card,
        }),
        // Add a 25 second timeout as a backup (Worldpay has 10s, but this is a safety net)
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Worldpay authorization timeout')), 25000)
        ),
      ]);
      
      // Validate Worldpay response structure
      if (!worldpayResponse || !worldpayResponse.worldpayRef) {
        throw new Error('Invalid response from Worldpay: missing worldpayRef');
      }
    } catch (worldpayError: unknown) {
      console.error('Worldpay authorization error:', {
        name: worldpayError instanceof Error ? worldpayError.name : 'UnknownError',
        message: worldpayError instanceof Error ? worldpayError.message : String(worldpayError),
        error: worldpayError
      });
      // If Worldpay fails, we should not create the order - delete it
      if (!DISABLE_DB && prisma && orderId) {
        try {
          await prisma.order.delete({ where: { id: orderId } });
        } catch (deleteError) {
          console.error('Error deleting order after Worldpay failure:', deleteError);
        }
      }
      return NextResponse.json(
        { 
          error: 'Worldpay payment authorization failed', 
          message: worldpayError instanceof Error ? worldpayError.message : 'Payment processing failed. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Create payment record
    if (!DISABLE_DB && prisma) {
      await prisma.payment.create({
        data: {
          orderId: orderId ?? '',
          gateway: 'worldpay',
          status: 'authorized',
          worldpayRef: worldpayResponse.worldpayRef,
          amount: pricing.total,
          currency: 'GBP',
        },
      });
    }

    // Automatically capture the payment (no manual authorization needed)
    let captureResult;
    try {
      captureResult = await capture(worldpayResponse.worldpayRef, pricing.total);
      
      if (captureResult.success && !DISABLE_DB && prisma) {
        // Update payment status to captured
        const payment = await prisma.payment.findFirst({
          where: { orderId: orderId ?? '' },
        });
        
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'captured',
              capturedAt: captureResult.capturedAt || new Date(),
            },
          });
        }

        // Update order status to captured (accepted)
        const updatedOrder = await prisma.order.update({
          where: { id: orderId ?? '' },
          data: {
            status: 'captured',
          },
          include: {
            items: true,
          },
        });

        // Send confirmation email to customer automatically
        if (updatedOrder.customerEmail) {
          try {
            const orderNumber = `#NS-${updatedOrder.createdAt.getFullYear()}-${updatedOrder.id.slice(0, 8).toUpperCase()}`;
            
            await sendOrderConfirmationEmail({
              orderId: updatedOrder.id,
              orderNumber,
              customerName: updatedOrder.customerName,
              customerEmail: updatedOrder.customerEmail,
              items: updatedOrder.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              subtotal: updatedOrder.subtotal,
              deliveryFee: updatedOrder.deliveryFee,
              tip: updatedOrder.tip,
              total: updatedOrder.total,
              fulfilment: updatedOrder.fulfilment,
              slotStart: updatedOrder.slotStart || undefined,
              slotEnd: updatedOrder.slotEnd || undefined,
              address: updatedOrder.addressLine1 ? {
                line1: updatedOrder.addressLine1,
                city: updatedOrder.city || '',
                postcode: updatedOrder.postcode || '',
              } : undefined,
              phone: updatedOrder.customerPhone,
            });
          } catch (emailError) {
            // Log email error but don't fail the payment
            console.error('Failed to send order confirmation email:', emailError);
          }
        }
      } else if (!captureResult.success) {
        // If capture fails, log but don't fail the order (payment is still authorized)
        console.error('Auto-capture failed, but payment is authorized:', captureResult.error);
      }
    } catch (captureError) {
      // If capture fails, log but don't fail the order (payment is still authorized)
      console.error('Auto-capture error (payment still authorized):', captureError);
    }

    return NextResponse.json({
      orderId: orderId ?? '',
      worldpayRef: worldpayResponse.worldpayRef,
      total: pricing.total,
      captured: captureResult?.success || false,
    });

  } catch (error: unknown) {
    console.error('Create intent error:', error);
    if (!DISABLE_DB && prisma && orderId) {
      try {
        await prisma.order.delete({ where: { id: orderId } });
      } catch (deleteError) {
        console.error('Error deleting order after failure:', deleteError);
      }
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
    
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Error details:', {
      message: errorMessage,
      name: errorName,
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Always return a response, never throw
    return NextResponse.json(
      { error: 'Failed to create payment intent', message: errorMessage },
      { status: 500 }
    );
  } finally {
    if (!DISABLE_DB && prisma) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma:', disconnectError);
      }
    }
  }
}
