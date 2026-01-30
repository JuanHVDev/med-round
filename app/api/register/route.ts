import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formSchema } from '@/lib/registerSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod schema
    let validatedData;
    try {
      validatedData = formSchema.parse(body);
      console.log('Validation successful:', validatedData);
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      if (validationError instanceof Error && 'errors' in validationError) {
        const zodError = validationError as { errors: Array<{ message: string }> };
        console.error('Zod errors:', zodError.errors);
        return NextResponse.json(
          { error: zodError.errors[0]?.message || 'Invalid data provided. Please check all fields.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid data provided. Please check all fields.' },
        { status: 400 }
      );
    }
    
    // Create user with Better Auth (automatically creates session)
    const user = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.fullName,
      },
    });

    if (!user?.user) {
      console.error('User creation failed: Invalid response from Better Auth');
      return NextResponse.json(
        { error: 'Error creating user account' },
        { status: 400 }
      );
    }

    // Create medical profile using Prisma
    try {
      await prisma.medicosProfile.create({
        data: {
          userId: user.user.id,
          fullName: validatedData.fullName,
          professionalId: validatedData.professionalId,
          studentType: validatedData.studentType,
          universityMatricula: validatedData.universityMatricula,
          hospital: validatedData.hospital,
          otherHospital: validatedData.otherHospital,
          specialty: validatedData.specialty,
          userType: validatedData.userType,
        },
      });
    } catch (profileError) {
      console.error('Profile creation failed:', profileError);
      // If profile creation fails, we should clean up the user
      // For now, return error to user
      return NextResponse.json(
        { error: 'Error creating medical profile. Please try again.' },
        { status: 500 }
      );
    }

    // Better Auth handles session creation automatically via cookies
    // No need to manually create session or return tokens
    return NextResponse.json({
      success: true,
      user: {
        id: user.user.id,
        name: user.user.name,
        email: user.user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Invalid data provided. Please check all fields.' },
        { status: 400 }
      );
    }
    
    // Handle duplicate email errors
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Email already registered. Please use a different email or sign in.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
