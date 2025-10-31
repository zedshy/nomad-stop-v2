import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all promo codes
export async function GET() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(promoCodes);
  } catch (error: any) {
    console.error('Failed to fetch promo codes:', error);
    console.error('Error details:', error.message, error.code);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST create new promo code
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      active,
    } = data;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Code, discountType, and discountValue are required' },
        { status: 400 }
      );
    }

    // Validate discountValue based on type
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json(
        { error: 'Fixed discount must be positive' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        name: code.toUpperCase(), // Use code as name if not provided
        description: description || null,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxDiscount: maxDiscount || null,
        startDate: validFrom ? new Date(validFrom) : new Date(),
        endDate: validUntil ? new Date(validUntil) : new Date('2099-12-31'), // Use far future date if not set (since DB requires it)
        usageLimit: usageLimit || null,
        isActive: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error('Failed to create promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

