import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const DISABLE_DB = process.env.DISABLE_DB === 'true';
let prisma: PrismaClient | null = null;

// GET all categories with their sort order
export async function GET() {
  try {
    if (DISABLE_DB) {
      return NextResponse.json([]);
    }

    if (!prisma) {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST - Update category order
export async function POST(request: NextRequest) {
  try {
    if (DISABLE_DB) {
      return NextResponse.json({ success: true });
    }

    if (!prisma) {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    }

    const { categories } = await request.json();

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' },
        { status: 400 }
      );
    }

    // Update each category's sort order
    await Promise.all(
      categories.map((cat: { name: string; sortOrder: number }, index: number) =>
        prisma!.category.upsert({
          where: { name: cat.name },
          update: { sortOrder: index },
          create: {
            name: cat.name,
            sortOrder: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update category order:', error);
    return NextResponse.json(
      { error: 'Failed to update category order' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

