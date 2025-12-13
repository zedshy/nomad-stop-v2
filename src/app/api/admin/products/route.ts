import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// GET all products
export async function GET() {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      // Return mock products when DB is disabled so admin can see menu structure
      // Note: Changes won't persist until database is connected
      return NextResponse.json(MOCK_PRODUCTS);
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const products = await prisma.product.findMany({
      include: {
        variants: true,
        addons: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products from database. Falling back to mock data.', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If table doesn't exist, return mock data (migrations haven't been run yet)
    if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      console.warn('Product table does not exist yet. Returning mock data. Run migrations: npx prisma migrate deploy');
    }
    
    // Return mock products on error so admin can still see menu structure
    return NextResponse.json(MOCK_PRODUCTS);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Please enable database connection to save products. Changes made in admin will appear on the website once the database is connected and seeded.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const data = await request.json();
    const { name, slug, description, category, popular, allergens, sortOrder, imageUrl, isMeal, mealDrinkCategory, variants, addons } = data;
    
    // Process addons to include isRequired
    const processedAddons = (addons || []).map((addon: {name: string; price: number; isRequired?: boolean}) => ({
      name: addon.name,
      price: addon.price,
      isRequired: addon.isRequired || false,
    }));

    // Validate required fields
    if (!name || !slug || !category) {
      return NextResponse.json(
        { error: 'Name, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        category,
        popular: popular || false,
        allergens: allergens || '',
        sortOrder: sortOrder || 0,
        imageUrl: imageUrl || null,
        isMeal: isMeal || false,
        mealDrinkCategory: mealDrinkCategory || null,
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

