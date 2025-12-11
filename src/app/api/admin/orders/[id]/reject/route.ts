import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { voidAuth } from '@/lib/worldpay';

const DISABLE_DB = process.env.DISABLE_DB === 'true';
let prisma: PrismaClient | null = null;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot reject order.' },
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

    // Get order with payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status === 'rejected') {
      return NextResponse.json(
        { error: 'Order is already rejected' },
        { status: 400 }
      );
    }

    // If payment exists and is still authorized, void it in Worldpay
    if (order.payment && order.payment.status === 'authorized' && order.payment.worldpayRef) {
      try {
        const voidResult = await voidAuth(order.payment.worldpayRef);
        
        if (voidResult.success) {
          // Update payment status to voided
          await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'voided',
            },
          });
        } else {
          console.error('Failed to void payment in Worldpay:', voidResult.error);
          // Continue with order rejection even if void fails
          // The payment authorization will expire naturally
        }
      } catch (voidError) {
        console.error('Error voiding payment in Worldpay:', voidError);
        // Continue with order rejection even if void fails
      }
    }

    // Update order status to rejected
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'rejected',
      },
    });

    // TODO: Send rejection email to customer if needed

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
    });

  } catch (error) {
    console.error('Reject order error:', error);
    return NextResponse.json(
      { error: 'Failed to reject order' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

