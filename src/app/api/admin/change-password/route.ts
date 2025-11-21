import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

// POST change password (uses environment variable for now, migrates to DB later)
export async function POST(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      return NextResponse.json(
        { error: 'Database is disabled. Cannot change password. Please connect the database first.' },
        { status: 503 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

    const data = await request.json();
    const { email, currentPassword, newPassword } = data;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if admin exists
    let admin;
    try {
      admin = await prisma.admin.findUnique({
        where: { email },
      });
    } catch (tableError) {
      const tableErrorMessage = tableError instanceof Error ? tableError.message : String(tableError);
      console.error('Error querying admin table:', tableErrorMessage);
      
      if (tableErrorMessage.includes('table') && tableErrorMessage.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Admin table does not exist. Please run: npx prisma migrate deploy' },
          { status: 500 }
        );
      }
      
      if (tableErrorMessage.includes('undefined') || tableErrorMessage.includes('Cannot read properties')) {
        return NextResponse.json(
          { error: 'Database schema not synced. Please run: npx prisma generate && npx prisma migrate deploy' },
          { status: 500 }
        );
      }
      
      throw tableError; // Re-throw if it's a different error
    }

    if (!admin) {
      // Fallback to environment variable for backward compatibility
      const envPassword = process.env.ADMIN_PASSWORD || 'change-me';
      if (currentPassword === envPassword) {
        // Check if admin table exists and is accessible
        try {
          // Migrate to database - create admin account
          const passwordHash = await bcrypt.hash(newPassword, 10);
          admin = await prisma.admin.create({
            data: {
              email: email || 'admin@nomadstop.com',
              passwordHash,
              role: 'super_admin',
              name: 'Main Administrator',
            },
          });

          return NextResponse.json({ 
            success: true,
            message: 'Password changed successfully. Admin account created in database.',
          });
        } catch (createError) {
          console.error('Failed to create admin account:', createError);
          const createErrorMessage = createError instanceof Error ? createError.message : String(createError);
          
          if (createErrorMessage.includes('table') && createErrorMessage.includes('does not exist')) {
            return NextResponse.json(
              { error: 'Admin table does not exist. Please run: npx prisma migrate deploy' },
              { status: 500 }
            );
          }
          
          return NextResponse.json(
            { error: `Failed to create admin account: ${createErrorMessage}` },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Admin account not found and current password does not match environment variable. Please check your email and password.' },
        { status: 401 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 401 }
      );
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Failed to change password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorDetails);
    
    // Provide more specific error messages
    if (errorMessage.includes('Can\'t reach database')) {
      return NextResponse.json(
        { error: 'Cannot connect to database. Please check your DATABASE_URL and ensure PostgreSQL is running.' },
        { status: 503 }
      );
    }
    
    if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database tables not found. Please run migrations: npx prisma migrate deploy' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to change password: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

