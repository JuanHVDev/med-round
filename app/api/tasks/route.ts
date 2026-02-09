import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { TaskService } from "@/services/tasks/taskService";
import type { CreateTaskInput, TaskFilters } from "@/services/tasks/types";

const taskService = new TaskService(prisma);

const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW = 60 * 1000;

export async function GET(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
    {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const medicosProfile = await prisma.medicosProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!medicosProfile)
    {
      return NextResponse.json(
        { error: "Perfil de médico no encontrado", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const filters: TaskFilters = {
      assignedTo: medicosProfile.id,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const status = searchParams.get("status");
    if (status && ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      filters.status = status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    }

    const priority = searchParams.get("priority");
    if (priority && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      filters.priority = priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }

    const patientId = searchParams.get("patientId");
    if (patientId) filters.patientId = patientId;

    const assignedTo = searchParams.get("assignedTo");
    if (assignedTo) filters.assignedTo = assignedTo;

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const rateLimit = await checkRateLimit(`tasks:list:${medicosProfile.id}`);
    if (!rateLimit.allowed)
    {
      return NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMIT_ERROR" },
        { status: 429, headers: getRateLimitHeaders(0, rateLimit.resetTime) }
      );
    }

    const result = await taskService.list(filters);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result, { headers: getRateLimitHeaders(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW) });
  }
  catch (error)
  {
    console.error("Error en GET /api/tasks:", error);
    return NextResponse.json(
      { error: "Error interno", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session)
    {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const medicosProfile = await prisma.medicosProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!medicosProfile)
    {
      return NextResponse.json(
        { error: "Perfil de médico no encontrado", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const body: CreateTaskInput = await request.json();

    const rateLimit = await checkRateLimit(`tasks:create:${medicosProfile.id}`);
    if (!rateLimit.allowed)
    {
      return NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMIT_ERROR" },
        { status: 429, headers: getRateLimitHeaders(0, rateLimit.resetTime) }
      );
    }

    const result = await taskService.create(body, medicosProfile.id);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result, { status: 201, headers: getRateLimitHeaders(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW) });
  }
  catch (error)
  {
    console.error("Error en POST /api/tasks:", error);
    return NextResponse.json(
      { error: "Error interno", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
