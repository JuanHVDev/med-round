import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { TaskService } from "@/services/tasks/taskService";

const taskService = new TaskService(prisma);

const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW = 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)
{
  try
  {
    const { id } = await params;
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

    const rateLimit = await checkRateLimit(`tasks:complete:${medicosProfile.id}`);
    if (!rateLimit.allowed)
    {
      return NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMIT_ERROR" },
        { status: 429, headers: getRateLimitHeaders(0, rateLimit.resetTime) }
      );
    }

    const result = await taskService.complete(id);

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
    console.error(`Error en POST /api/tasks/${(await params).id}/complete:`, error);
    return NextResponse.json(
      { error: "Error interno", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
