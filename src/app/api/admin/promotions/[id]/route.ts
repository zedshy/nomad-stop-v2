import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single promo code
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('Failed to fetch promo code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT update promo code
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if promo code exists
    const existing = await prisma.promoCode.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Validate discountValue if provided
    if (discountValue !== undefined) {
      const type = discountType || existing.discountType;
      if (type === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        return NextResponse.json(
          { error: 'Percentage discount must be between 0 and 100' },
          { status: 400 }
        );
      }

      if (type === 'fixed' && discountValue < 0) {
        return NextResponse.json(
          { error: 'Fixed discount must be positive' },
          { status: 400 }
        );
      }
    }

    // Check if code is being changed and if new code already exists
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Promo code already exists' },
          { status: 400 }
        );
      }
    }

    const promoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase() : existing.code,
        name: code ? code.toUpperCase() : existing.code,
        description: description !== undefined ? description : existing.description,
        discountType: discountType || existing.discountType,
        discountValue: discountValue !== undefined ? discountValue : existing.discountValue,
        minOrderAmount: minOrderAmount !== undefined ? (minOrderAmount || 0) : existing.minOrderAmount,
        maxDiscount: maxDiscount !== undefined ? maxDiscount : existing.maxDiscount,
        startDate: validFrom ? new Date(validFrom) : existing.startDate,
        endDate: validUntil !== undefined ? (validUntil ? new Date(validUntil) : new Date('2099-12-31')) : existing.endDate,
        usageLimit: usageLimit !== undefined ? usageLimit : existing.usageLimit,
        isActive: active !== undefined ? active : existing.isActive,
      },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('Failed to update promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    await prisma.promoCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Failed to delete promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

