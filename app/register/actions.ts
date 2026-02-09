"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formSchema, type FormData } from "@/lib/registerSchema";
import { headers } from "next/headers";

export type RegisterResult =
  | { success: true; user: { id: string; name: string; email: string } }
  | { success: false; error: string };

export async function registerUser(data: FormData): Promise<RegisterResult> {
  try {
    // Validate with Zod schema
    const validatedData = formSchema.parse(data);

    // Create user with Better Auth
    const user = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.fullName,
      },
      headers: await headers(),
    });

    if (!user?.user) {
      return {
        success: false,
        error: "Error creating user account",
      };
    }

    // Create medical profile using Prisma
    // Si el hospital es "Otro", usar el valor de otherHospital
    const hospitalValue = validatedData.hospital === "Otro" && validatedData.otherHospital
      ? validatedData.otherHospital
      : validatedData.hospital;

    await prisma.medicosProfile.create({
      data: {
        userId: user.user.id,
        fullName: validatedData.fullName,
        professionalId: validatedData.professionalId,
        studentType: validatedData.studentType,
        universityMatricula: validatedData.universityMatricula,
        hospital: hospitalValue,
        otherHospital: validatedData.otherHospital,
        specialty: validatedData.specialty,
        userType: validatedData.userType,
      },
    });

    return {
      success: true,
      user: {
        id: user.user.id,
        name: user.user.name || validatedData.fullName,
        email: user.user.email,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Invalid data provided. Please check all fields.",
      };
    }

    // Handle duplicate email errors
    if (error instanceof Error && error.message.includes("duplicate")) {
      return {
        success: false,
        error: "Email already registered. Please use a different email or sign in.",
      };
    }

    return {
      success: false,
      error: "Registration failed. Please try again later.",
    };
  }
}
