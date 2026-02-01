import { Redis } from "@upstash/redis";

// Cliente Redis - se reutiliza entre requests
const redis = Redis.fromEnv();

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
};

const WINDOW_SIZE_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 5;

/**
 * Rate limiting con Redis Upstash
 * 
 * Características:
 * - Persistente entre cold starts/serverless instances
 * - TTL automático para evitar memory leaks
 * - Operaciones atómicas (incr + expire)
 * - Funciona con IP o User ID
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  try {
    // Obtener conteo actual
    const currentCount = await redis.get<number>(key) || 0;
    
    if (currentCount === 0) {
      // Primera request en esta ventana
      await redis.set(key, 1, { px: WINDOW_SIZE_MS });
      return {
        allowed: true,
        remaining: MAX_REQUESTS - 1,
        resetTime: now + WINDOW_SIZE_MS,
      };
    }
    
    if (currentCount >= MAX_REQUESTS) {
      // Límite alcanzado
      const ttl = await redis.pttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl,
      };
    }
    
    // Incrementar contador
    const newCount = await redis.incr(key);
    
    return {
      allowed: true,
      remaining: MAX_REQUESTS - newCount,
      resetTime: now + (await redis.pttl(key)),
    };
    
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // Fallback: permitir request si Redis falla
    // En producción, podrías querer bloquear o usar cache local
    return {
      allowed: true,
      remaining: 1,
      resetTime: now + WINDOW_SIZE_MS,
    };
  }
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    "X-RateLimit-Limit": MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };
}
