import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmationEmail } from '@/lib/email';

const DISABLE_DB = process.env.DISABLE_DB === 'true';
let prisma: PrismaClient | null = null;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot accept order.' },
        { status: 503 }
      );
    }

    if (!prisma) {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    }

    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status === 'captured') {
      return NextResponse.json(
        { error: 'Order is already accepted' },
        { status: 400 }
      );
    }

    // Update order status to captured (accepted)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'captured',
      },
      include: {
        items: true,
      },
    });

    // Send confirmation email to customer
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
        // Log email error but don't fail the order acceptance
        console.error('Failed to send order confirmation email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
    });

  } catch (error) {
    console.error('Accept order error:', error);
    return NextResponse.json(
      { error: 'Failed to accept order' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

