import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyWebhookSignature, processWebhookPayload } from '@/lib/worldpay';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-worldpay-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const webhookData = processWebhookPayload(payload);

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { worldpayRef: webhookData.worldpayRef },
      include: { order: true },
    });

    if (!payment) {
      console.error('Payment not found for webhook:', webhookData.worldpayRef);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status based on webhook
    const updateData: {status: 'authorized' | 'captured' | 'voided' | 'failed'; capturedAt?: Date} = {
      status: webhookData.status as 'authorized' | 'captured' | 'voided' | 'failed',
    };

    if (webhookData.status === 'captured') {
      updateData.capturedAt = new Date();
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    // Update order status
    let orderStatus = payment.order.status;
    switch (webhookData.status) {
      case 'captured':
        orderStatus = 'captured';
        break;
      case 'voided':
        orderStatus = 'rejected';
        break;
      case 'failed':
        orderStatus = 'rejected';
        break;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
      include: {
        items: true,
      },
    });

    // Send confirmation email when order is captured
    if (webhookData.status === 'captured' && updatedOrder.customerEmail) {
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
        // Log email error but don't fail the webhook
        console.error('Failed to send order confirmation email:', emailError);
      }
    }

    // Store webhook payload for audit
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        // In a real implementation, you might store the raw webhook payload
        // For now, we'll just log it
      },
    });

    console.log('Webhook processed successfully:', {
      worldpayRef: webhookData.worldpayRef,
      status: webhookData.status,
      orderId: payment.orderId,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
