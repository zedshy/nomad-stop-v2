import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Code and subtotal are required' },
        { status: 400 }
      );
    }

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, message: 'Promo code not found' },
        { status: 200 }
      );
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { valid: false, message: 'This promo code is not active' },
        { status: 200 }
      );
    }

    // Check if promo code has expired
    const now = new Date();
    if (now < new Date(promoCode.startDate)) {
      return NextResponse.json(
        { valid: false, message: 'This promo code is not yet valid' },
        { status: 200 }
      );
    }

    if (now > new Date(promoCode.endDate)) {
      return NextResponse.json(
        { valid: false, message: 'This promo code has expired' },
        { status: 200 }
      );
    }

    // Check minimum order amount
    if (subtotal < promoCode.minOrderAmount) {
      const minOrder = (promoCode.minOrderAmount / 100).toFixed(2);
      return NextResponse.json(
        { valid: false, message: `Minimum order amount of £${minOrder} required` },
        { status: 200 }
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { valid: false, message: 'This promo code has reached its usage limit' },
        { status: 200 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.discountType === 'percentage') {
      discount = Math.round(subtotal * (promoCode.discountValue / 100));
      if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
        discount = promoCode.maxDiscount;
      }
    } else {
      discount = promoCode.discountValue;
    }

    return NextResponse.json({
      valid: true,
      message: 'Promo code applied successfully',
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        maxDiscount: promoCode.maxDiscount,
      },
      discount,
    });
  } catch (error) {
    console.error('Promo code validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

