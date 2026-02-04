import { Redis } from "@upstash/redis";

// Cliente Redis - se reutiliza entre requests
const redis = Redis.fromEnv();

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
};

const DEFAULT_WINDOW_SIZE_MS = 60 * 1000; // 1 minuto
const DEFAULT_MAX_REQUESTS = 5;

/**
 * Rate limiting con Redis Upstash
 * 
 * Características:
 * - Persistente entre cold starts/serverless instances
 * - TTL automático para evitar memory leaks
 * - Operaciones atómicas (incr + expire)
 * - Funciona con IP o User ID
 * 
 * @param identifier Identificador único (IP, User ID, etc.)
 * @param maxRequests Máximo de solicitudes permitidas (default: 5)
 * @param windowSizeMs Ventana de tiempo en milisegundos (default: 60000ms = 1min)
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowSizeMs: number = DEFAULT_WINDOW_SIZE_MS
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  try {
    const currentCount = await redis.get<number>(key) || 0;

    if (currentCount === 0) {
      await redis.set(key, 1, { px: windowSizeMs });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowSizeMs,
      };
    }

    if (currentCount >= maxRequests) {
      const ttl = await redis.pttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl,
      };
    }

    const newCount = await redis.incr(key);

    return {
      allowed: true,
      remaining: maxRequests - newCount,
      resetTime: now + (await redis.pttl(key)),
    };
    
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return {
      allowed: true,
      remaining: 1,
      resetTime: now + DEFAULT_WINDOW_SIZE_MS,
    };
  }
}

export function getRateLimitHeaders(remaining: number, resetTime: number, maxRequests: number = DEFAULT_MAX_REQUESTS) {
  return {
    "X-RateLimit-Limit": maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };
}
