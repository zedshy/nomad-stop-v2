import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

export async function POST(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    const { email, password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Try database authentication first
    if (!DISABLE_DB) {
      try {
        const { PrismaClient } = await import('@prisma/client');
        prisma = new PrismaClient();

        // Check if admin model exists
        if (!prisma.admin || typeof prisma.admin.findUnique !== 'function') {
          console.warn('Admin model not available in Prisma client');
          throw new Error('Admin model not available');
        }

        // If email/username provided, look up by email or username
        if (email) {
          try {
            // Try to find by email first
            let admin = await prisma.admin.findUnique({
              where: { email },
            });

            // If not found by email, try to find by username
            if (!admin && email) {
              admin = await prisma.admin.findFirst({
                where: { 
                  username: email,
                  isActive: true 
                },
              });
            }

            if (admin && admin.isActive) {
              const isValid = await bcrypt.compare(password, admin.passwordHash);
              if (isValid) {
                // Update last login
                await prisma.admin.update({
                  where: { id: admin.id },
                  data: { lastLogin: new Date() },
                });

                return NextResponse.json({
                  success: true,
                  admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    name: admin.name,
                    role: admin.role,
                  },
                });
              }
            }
          } catch (adminError) {
            const adminErrorMessage = adminError instanceof Error ? adminError.message : String(adminError);
            if (adminErrorMessage.includes('table') && adminErrorMessage.includes('does not exist')) {
              console.warn('Admin table does not exist yet');
              // Fall through to environment variable check
            } else {
              throw adminError;
            }
          }
        } else {
          // Fallback: check all active admins
          try {
            const admins = await prisma.admin.findMany({
              where: { isActive: true },
            });

            for (const admin of admins) {
              const isValid = await bcrypt.compare(password, admin.passwordHash);
              if (isValid) {
                await prisma.admin.update({
                  where: { id: admin.id },
                  data: { lastLogin: new Date() },
                });

                return NextResponse.json({
                  success: true,
                  admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    name: admin.name,
                    role: admin.role,
                  },
                });
              }
            }
          } catch (adminError) {
            const adminErrorMessage = adminError instanceof Error ? adminError.message : String(adminError);
            if (adminErrorMessage.includes('table') && adminErrorMessage.includes('does not exist')) {
              console.warn('Admin table does not exist yet');
              // Fall through to environment variable check
            } else {
              throw adminError;
            }
          }
        }
      } catch (dbError) {
        console.error('Database auth error:', dbError);
        const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        
        // If table doesn't exist, just fall through to environment variable check
        if (dbErrorMessage.includes('table') && dbErrorMessage.includes('does not exist')) {
          console.warn('Admin table does not exist yet. Using environment variable fallback.');
          // Fall through to environment variable check
        } else {
          // For other database errors, log but still allow fallback
          console.error('Database error details:', dbErrorMessage);
        }
        // Fall through to environment variable check
      }
    }

    // Fallback to environment variable for backward compatibility
    // Require username/email to be "admin" when using environment variable fallback
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'change-me';
    // Check if username/email is "admin" (case-insensitive) and password matches
    if (email.trim().toLowerCase() === 'admin' && password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        admin: {
          email: email.trim(),
          username: 'admin',
          role: 'super_admin',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
