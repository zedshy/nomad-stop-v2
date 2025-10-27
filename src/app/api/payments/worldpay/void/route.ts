import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { voidAuth } from '@/lib/worldpay';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { worldpayRef } = await request.json();

    if (!worldpayRef) {
      return NextResponse.json(
        { error: 'Worldpay reference is required' },
        { status: 400 }
      );
    }

    // Get payment record
    const payment = await prisma.payment.findFirst({
      where: { worldpayRef },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'authorized') {
      return NextResponse.json(
        { error: 'Payment is not in authorized state' },
        { status: 400 }
      );
    }

    // Void payment
    const voidResult = await voidAuth(worldpayRef);

    if (!voidResult.success) {
      return NextResponse.json(
        { error: voidResult.error || 'Void failed' },
        { status: 500 }
      );
    }

    // Update payment and order status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'voided',
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'rejected',
      },
    });

    return NextResponse.json({
      success: true,
      worldpayRef,
      voidedAt: voidResult.voidedAt,
    });

  } catch (error) {
    console.error('Void payment error:', error);
    return NextResponse.json(
      { error: 'Failed to void payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
