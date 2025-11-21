import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// PUT update admin user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot update admin user.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const { id } = await context.params;
    const data = await request.json();
    const { email, username, password, name, role, isActive } = data;

    // Check if admin exists
    const existing = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== existing.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Admin with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Check if username is being changed and if new username already exists
    if (username && username !== existing.username) {
      const usernameExists = await prisma.admin.findUnique({
        where: { username },
      });

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Admin with this username already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      username?: string | null;
      passwordHash?: string;
      name?: string | null;
      role?: 'super_admin' | 'admin' | 'staff';
      isActive?: boolean;
    } = {};

    if (email) updateData.email = email;
    if (username !== undefined) updateData.username = username || null;
    if (name !== undefined) updateData.name = name || null;
    if (role && (role === 'super_admin' || role === 'admin' || role === 'staff')) {
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// DELETE admin user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot delete admin user.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const { id } = await context.params;

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

