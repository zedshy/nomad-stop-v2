import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// GET single product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    const { id } = await context.params;

    if (DISABLE_DB) {
      // Return mock product when DB is disabled
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
      if (!mockProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(mockProduct);
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        addons: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Please enable database connection to update products. Changes made in admin will appear on the website once the database is connected.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const { id: productId } = await context.params;
    const data = await request.json();
    const { name, slug, description, category, popular, allergens, sortOrder, imageUrl, isMeal, mealDrinkCategory, variants, addons } = data;
    
    // Process addons to include isRequired
    const processedAddons = (addons || []).map((addon: {name: string; price: number; isRequired?: boolean}) => ({
      name: addon.name,
      price: addon.price,
      isRequired: addon.isRequired || false,
    }));

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Delete existing variants and addons, then create new ones
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    await prisma.addon.deleteMany({
      where: { productId },
    });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug: slug || existing.slug,
        description: description || null,
        category,
        popular: popular || false,
        allergens: allergens || '',
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder || 0,
        imageUrl: imageUrl !== undefined ? (imageUrl || null) : existing.imageUrl,
        isMeal: isMeal !== undefined ? isMeal : false,
        mealDrinkCategory: mealDrinkCategory !== undefined ? (mealDrinkCategory || null) : null,
        variants: {
          create: (variants || []).map((v: {name: string; price: number; bases?: string[] | null; toppings?: Array<{name: string; price: number}> | null}) => ({
            name: v.name,
            price: v.price,
            bases: v.bases || null,
            toppings: v.toppings || null,
          })),
        },
        addons: {
          create: processedAddons,
        },
      },
      include: {
        variants: true,
        addons: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Please enable database connection to delete products.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

