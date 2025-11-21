import { NextRequest, NextResponse } from 'next/server';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// GET all promo codes
export async function GET() {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      // Return empty array when DB is disabled
      return NextResponse.json([]);
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(promoCodes);
  } catch (error: unknown) {
    console.error('Failed to fetch promo codes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
    console.error('Error details:', errorMessage, errorCode);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST create new promo code
export async function POST(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot create promo code.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

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
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

