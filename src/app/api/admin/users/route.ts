import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// GET all admin users
export async function GET() {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json([]);
    }

    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (prismaError) {
      console.error('Failed to import or create PrismaClient:', prismaError);
      // Return empty array if Prisma client can't be created
      return NextResponse.json([]);
    }

    try {
      // Check if admin model is available
      if (!prisma) {
        console.warn('Prisma client is null');
        return NextResponse.json([]);
      }
      
      if (!prisma.admin) {
        console.error('Admin model not available in Prisma client. Available models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_') && typeof prisma[k as keyof typeof prisma] === 'object'));
        return NextResponse.json([]);
      }
      
      if (typeof prisma.admin.findMany !== 'function') {
        console.error('Admin model exists but findMany is not a function');
        return NextResponse.json([]);
      }

      const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        // Don't return passwordHash
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

      return NextResponse.json(admins);
    } catch (queryError) {
      console.error('Failed to query admins:', queryError);
      const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
      
      // If table doesn't exist, return empty array (migrations haven't been run yet)
      if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
        console.warn('Admin table does not exist yet. Run migrations: npx prisma migrate deploy');
        return NextResponse.json([]);
      }
      
      // If database connection fails, return empty array
      if (errorMessage.includes('Can\'t reach database') || errorMessage.includes('Connection') || errorMessage.includes('P1001')) {
        console.warn('Database connection failed. Returning empty array.');
        return NextResponse.json([]);
      }
      
      // Return empty array on any other error to prevent frontend crashes
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Failed to fetch admins - outer catch:', error);
    // Return empty array on any error to prevent frontend crashes
    return NextResponse.json([]);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST create new admin user
export async function POST(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot create admin user.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    // Check if admin model is available
    if (!prisma || !prisma.admin || typeof prisma.admin.findUnique !== 'function') {
      console.error('Admin model not available in Prisma client');
      return NextResponse.json(
        { error: 'Admin model not available. Please run: npx prisma generate' },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { email, username, password, name, role } = data;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await prisma.admin.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Admin with this username already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        username: username || null,
        passwordHash,
        name: name || null,
        role: role || 'admin',
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack, error });
    
    // Provide more specific error messages
    if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Admin table does not exist. Please run: npx prisma migrate deploy' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('Can\'t reach database') || errorMessage.includes('P1001')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your DATABASE_URL.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('Authentication failed') || errorMessage.includes('P1000')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Please check your DATABASE_URL credentials.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create admin user: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

