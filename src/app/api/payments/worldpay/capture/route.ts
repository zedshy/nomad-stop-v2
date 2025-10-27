import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { capture } from '@/lib/worldpay';

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

    // Capture payment
    const captureResult = await capture(worldpayRef, payment.amount);

    if (!captureResult.success) {
      return NextResponse.json(
        { error: captureResult.error || 'Capture failed' },
        { status: 500 }
      );
    }

    // Update payment and order status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'captured',
        capturedAt: captureResult.capturedAt,
      },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'captured',
      },
    });

    return NextResponse.json({
      success: true,
      worldpayRef,
      capturedAt: captureResult.capturedAt,
    });

  } catch (error) {
    console.error('Capture payment error:', error);
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
