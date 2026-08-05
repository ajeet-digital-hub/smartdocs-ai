import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from '@upstash/redis';

// --- Rate Limiter Configurations ---

const redisClient =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Use RateLimiterRedis if Redis is configured, otherwise fall back to in-memory for local dev.
const Limiter = redisClient ? RateLimiterRedis : RateLimiterMemory;
const limiterOptions = redisClient ? { storeClient: redisClient } : {};

const aiLimiter = new (Limiter as typeof RateLimiterMemory)({
  ...limiterOptions,
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
  keyPrefix: 'ai',
});

const authLimiter = new (Limiter as typeof RateLimiterMemory)({
  ...limiterOptions,
  points: 5, // 5 requests
  duration: 60 * 5, // per 5 minutes
  keyPrefix: 'auth',
});

const defaultLimiter = new (Limiter as typeof RateLimiterMemory)({
  ...limiterOptions,
  points: 20, // 20 requests
  duration: 15, // per 15 seconds
  keyPrefix: 'default',
});

const getLimiter = (pathname: string) => {
  if (pathname.startsWith('/api/ai/')) return aiLimiter;
  if (pathname.startsWith('/api/auth/')) return authLimiter;
  if (pathname.startsWith('/api/credits/')) return authLimiter;
  return defaultLimiter;
};

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const limiter = getLimiter(request.nextUrl.pathname);

  try {
    await limiter.consume(ip);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many requests',
        message: 'You have exceeded the request limit. Please try again in a moment.',
      },
      { status: 429 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all API routes except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Health checks or other non-user-facing endpoints
     */
    '/api/:path*',
    // Explicitly list high-risk endpoints to ensure they are covered
    '/api/ai/agent',
    '/api/ai/search/:path*',
    '/api/credits/recharge',
    '/api/credits/recharge/verify',
    '/api/magic-batch-scan/upload',
    '/api/magic-batch-scan/process',
  ],
};