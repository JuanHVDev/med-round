import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock functions in hoisted scope
const mockFns = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  incr: vi.fn(),
  pttl: vi.fn(),
}));

// Mock Redis module
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: mockFns.get,
      set: mockFns.set,
      incr: mockFns.incr,
      pttl: mockFns.pttl,
    }),
  },
}));

// Import after mock
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  const identifier = "test-ip-127.0.0.1";
  const WINDOW_SIZE_MS = 60 * 1000;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkRateLimit", () => {
    it("should allow first request and set count to 1", async () => {
      mockFns.get.mockResolvedValue(0);
      mockFns.set.mockResolvedValue("OK");

      const result = await checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(mockFns.set).toHaveBeenCalledWith(
        `ratelimit:${identifier}`,
        1,
        { px: WINDOW_SIZE_MS }
      );
    });

    it("should allow requests up to the limit (5)", async () => {
      // Request 1
      mockFns.get.mockResolvedValue(0);
      mockFns.set.mockResolvedValue("OK");
      let result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);

      // Request 2
      mockFns.get.mockResolvedValue(1);
      mockFns.incr.mockResolvedValue(2);
      mockFns.pttl.mockResolvedValue(55000);
      result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);

      // Request 3
      mockFns.get.mockResolvedValue(2);
      mockFns.incr.mockResolvedValue(3);
      result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);

      // Request 4
      mockFns.get.mockResolvedValue(3);
      mockFns.incr.mockResolvedValue(4);
      result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);

      // Request 5 (last allowed)
      mockFns.get.mockResolvedValue(4);
      mockFns.incr.mockResolvedValue(5);
      result = await checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it("should block request after limit is reached (6th request)", async () => {
      mockFns.get.mockResolvedValue(5);
      mockFns.pttl.mockResolvedValue(45000);

      const result = await checkRateLimit(identifier);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it("should use different keys for different identifiers", async () => {
      const id1 = "user-1";
      const id2 = "user-2";

      mockFns.get
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockFns.set.mockResolvedValue("OK");

      await checkRateLimit(id1);
      await checkRateLimit(id2);

      expect(mockFns.set).toHaveBeenCalledWith(
        `ratelimit:${id1}`,
        1,
        expect.any(Object)
      );
      expect(mockFns.set).toHaveBeenCalledWith(
        `ratelimit:${id2}`,
        1,
        expect.any(Object)
      );
    });

    it("should handle Redis errors gracefully with fallback", async () => {
      mockFns.get.mockRejectedValue(new Error("Redis connection failed"));

      const result = await checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it("should return correct reset time", async () => {
      mockFns.get.mockResolvedValue(0);
      mockFns.set.mockResolvedValue("OK");

      const before = Date.now();
      const result = await checkRateLimit(identifier);
      const after = Date.now();

      expect(result.resetTime).toBeGreaterThanOrEqual(before + WINDOW_SIZE_MS);
      expect(result.resetTime).toBeLessThanOrEqual(after + WINDOW_SIZE_MS + 100);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("should return correct headers format", () => {
      const remaining = 3;
      const resetTime = Date.now() + 45000;

      const headers = getRateLimitHeaders(remaining, resetTime);

      expect(headers).toEqual({
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "3",
        "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      });
    });

    it("should handle zero remaining requests", () => {
      const remaining = 0;
      const resetTime = Date.now() + 60000;

      const headers = getRateLimitHeaders(remaining, resetTime);

      expect(headers["X-RateLimit-Remaining"]).toBe("0");
      expect(headers["X-RateLimit-Limit"]).toBe("5");
    });
  });

  describe("Integration scenarios", () => {
    it("should simulate sequential requests to same identifier", async () => {
      // Track actual count in Redis-like manner
      // First request: get returns 0, set is called with 1 -> count = 1
      // Subsequent: get returns current, incr increments -> count increases
      let currentCount = 0;

      mockFns.get.mockImplementation(() => {
        return Promise.resolve(currentCount);
      });

      mockFns.set.mockImplementation(() => {
        currentCount = 1;
        return Promise.resolve("OK");
      });

      mockFns.incr.mockImplementation(() => {
        currentCount++;
        return Promise.resolve(currentCount);
      });

      mockFns.pttl.mockResolvedValue(55000);

      const results = [];
      for (let i = 0; i < 7; i++) {
        const result = await checkRateLimit("sequential-test");
        results.push(result);
      }

      // Verify progression
      expect(results[0].allowed).toBe(true); // count=0 -> set(1)
      expect(results[0].remaining).toBe(4);
      
      expect(results[1].allowed).toBe(true); // count=1 -> incr=2
      expect(results[1].remaining).toBe(3);
      
      expect(results[2].allowed).toBe(true); // count=2 -> incr=3
      expect(results[2].remaining).toBe(2);
      
      expect(results[3].allowed).toBe(true); // count=3 -> incr=4
      expect(results[3].remaining).toBe(1);
      
      expect(results[4].allowed).toBe(true); // count=4 -> incr=5
      expect(results[4].remaining).toBe(0);
      
      expect(results[5].allowed).toBe(false); // count=5 -> blocked
      expect(results[5].remaining).toBe(0);
      
      expect(results[6].allowed).toBe(false); // count=5 -> still blocked
      expect(results[6].remaining).toBe(0);
    });

    it("should handle Redis TTL correctly when limit reached", async () => {
      mockFns.get.mockResolvedValue(5);
      const expectedTtl = 30000;
      mockFns.pttl.mockResolvedValue(expectedTtl);

      const now = Date.now();
      const result = await checkRateLimit(identifier);

      expect(result.allowed).toBe(false);
      // Reset time should be approximately now + TTL
      expect(result.resetTime).toBeGreaterThanOrEqual(now + expectedTtl - 10);
      expect(result.resetTime).toBeLessThanOrEqual(now + expectedTtl + 10);
    });
  });
});
