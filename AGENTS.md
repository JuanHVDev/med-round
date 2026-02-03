# AGENTS.md - Development Guidelines for med-round

## Build & Development Commands

```bash
# Development
npm run dev             # Start Next.js dev server on http://localhost:3000
npm run build           # Build production application
npm run start           # Start production server
npm run analyze         # Analyze bundle size with @next/bundle-analyzer

# Linting (ESLint v9 with flat config)
npm run lint            # Run ESLint with auto-fix

# Testing (Vitest)
npm run test            # Run tests in watch mode
npm run test:ui         # Run tests with UI (vitest --ui)
npm run test:coverage   # Run tests with coverage report
npm run test:run        # Run all tests once (CI mode)
npm run test:unit       # Run unit tests only (tests/services, tests/lib)
npm run test:integration # Run integration tests only (tests/integration)
npx vitest run tests/lib/rate-limit.test.ts  # Run single test file
npx vitest run -t "should allow first request"  # Run single test by name
```

## Database Commands

```bash
# Production/Development (PostgreSQL)
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes (dev only)
npm run db:migrate      # Create and run migrations
npm run db:studio       # Open Prisma Studio GUI

# Testing (SQLite)
npm run db:test:generate  # Generate Prisma client for SQLite tests
npm run db:test:migrate   # Run migrations on test database
npm run db:test:studio    # Open Prisma Studio for test DB
```

## Project Structure

```
app/                    # Next.js 16 App Router
├── api/                # API routes (route.ts files)
│   ├── auth/[...auth]/ # Better Auth API handler
│   └── register/       # Registration API
├── (routes)/           # Page routes
├── layout.tsx          # Root layout
└── globals.css         # Tailwind CSS v4 imports

components/             # React components
├── ui/                 # shadcn/ui components (Button, Input, etc.)
├── providers/          # Context providers (AuthProvider)
└── forms/              # Form-specific components

lib/                    # Utilities and configurations
├── auth.ts             # Better Auth server configuration
├── auth-client.ts      # Better Auth client
├── prisma.ts           # Prisma singleton client
├── errors.ts           # Custom error classes
├── rate-limit.ts       # Redis rate limiting
├── email.ts            # Email service configuration
└── utils.ts            # cn() utility for Tailwind

services/               # Business logic layer
├── auth/               # Authentication services
├── email/              # Email services
├── types/              # Service type definitions
└── index.ts            # Service exports

stores/                 # Zustand state stores
hooks/                  # Custom React hooks
tests/                  # Test suites
├── lib/                # Unit tests for lib/
├── services/           # Unit tests for services/
├── integration/        # Integration tests
├── e2e/                # End-to-end tests (Playwright style)
├── setup.ts            # Vitest setup (runs before each file)
└── global-setup.ts     # Global setup (runs once)

prisma/
├── schema.prisma       # PostgreSQL schema (production)
└── schema.test.prisma  # SQLite schema (testing)
```

## TypeScript & Code Style

### Strict TypeScript Configuration
- `strict: true` enforced
- `noEmit: true` - Next.js handles compilation
- `moduleResolution: "bundler"` - Modern resolution
- **Never use `any`** - Always type properly

### Import Organization
```typescript
// 1. External libraries
import { NextRequest, NextResponse } from "next/server";
import type { Metadata } from "next";

// 2. Internal modules (@/* alias)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 3. Type imports (use `import type`)
import type { RegistrationData } from "@/services/types";
```

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `AuthProvider.tsx`)
- **Files/Folders**: camelCase (`utils.ts`, `registerSchema.ts`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Database Models**: PascalCase in Prisma, camelCase in code
- **API Routes**: lowercase (`route.ts`)
- **Variables/Functions**: camelCase

### Quotes & Formatting
- **Double quotes** enforced by ESLint (`"error", "double"`)
- No semicolons required (Next.js default)
- 2 spaces indentation
- Max line length: 100 characters (soft limit)

## Component Patterns

### Server Component (default)
```typescript
export default async function Page() {
  // Async data fetching, server-side logic
  return <div>Content</div>;
}
```

### Client Component
```typescript
"use client";

import { useState } from "react";

export function ClientComponent() {
  const [state, setState] = useState();
  // Client-side logic
}
```

### UI Component (shadcn/ui style)
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn(/* classes */)} {...props} />;
}
```

## Testing Guidelines

### Test Structure
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external modules (use vi.hoisted for top-level mocks)
const mockFns = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: () => mockFns },
}));

// Import after mocks
import { functionToTest } from "@/lib/module";

describe("Feature Name", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do something specific", async () => {
    // Arrange
    mockFns.get.mockResolvedValue(0);
    
    // Act
    const result = await functionToTest();
    
    // Assert
    expect(result.allowed).toBe(true);
    expect(mockFns.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number),
      expect.any(Object)
    );
  });
});
```

### Test Database (SQLite)
- Tests use SQLite via `prisma/schema.test.prisma`
- Database URL: `DATABASE_URL=file:./medround_test.db`
- Auto-cleanup between tests via `tests/setup.ts`
- Run `npm run db:test:generate` before testing if client outdated

### Test Categories
- **Unit tests**: Mock external dependencies (Redis, DB, email)
- **Integration tests**: Test API routes with real SQLite database
- **E2E tests**: Full user flows (minimal, use sparingly)

## Error Handling

### Custom Error Classes (lib/errors.ts)
```typescript
import { ErrorCodes, ZodValidationError, RateLimitError } from "@/lib/errors";

// In API routes
try {
  // logic
} catch (error) {
  if (error instanceof ZodValidationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 }
    );
  }
  
  console.error("Error:", error);
  return NextResponse.json(
    { error: "Error interno", code: ErrorCodes.INTERNAL_ERROR },
    { status: 500 }
    );
}
```

### HTTP Status Codes
- `400` - Bad Request (validation errors)
- `409` - Conflict (duplicate user)
- `429` - Rate limit exceeded
- `500` - Internal server error

## Database & Auth Patterns

### Prisma Singleton (lib/prisma.ts)
```typescript
import { prisma } from "@/lib/prisma";

// Usage in API routes or services
const user = await prisma.user.findUnique({ where: { id } });
```

### Better Auth Session Check
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Rate Limiting
```typescript
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const rateLimit = await checkRateLimit(`action:${ip}`);
if (!rateLimit.allowed) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    { status: 429, headers: getRateLimitHeaders(0, rateLimit.resetTime) }
  );
}
```

## Styling

- **Tailwind CSS v4**: Use `@import "tailwindcss"` in globals.css
- **Component variants**: Use `class-variance-authority` (cva)
- **Class merging**: Always use `cn()` utility from `@/lib/utils`
- **CSS variables**: Use for theming (defined in globals.css)

## Form Handling

- Use `react-hook-form` with Zod resolvers
- Validation schemas in `lib/registerSchema.ts`
- Server actions in `app/register/actions.ts`
- Multi-step forms use Zustand for state persistence

## State Management

- **Zustand**: For global state with persistence
- Use `persist` middleware for localStorage
- Example: `stores/registrationStore.ts`

## Git Workflow

- Run `npm run lint` before committing
- Husky pre-commit hooks run `lint-staged`
- Follow conventional commits: `feat:`, `fix:`, `refactor:`, `test:`
- Keep commits focused and atomic
- Never commit secrets or `.env` files

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...           # Production DB (Neon)
DATABASE_URL=file:./medround_test.db    # Test DB (SQLite)
BETTER_AUTH_SECRET=your-secret-key      # Auth secret (32+ chars)
BETTER_AUTH_URL=http://localhost:3000   # Server URL
NEXT_PUBLIC_BETTER_AUTH_URL=...         # Client URL

# Optional
UPSTASH_REDIS_REST_URL=...              # Rate limiting
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=...                      # Email service
```

## Key Notes

- **Spanish UI**: All user-facing text in Spanish (`lang="es"`)
- **Medical Domain**: App for medical professionals
- **Strict TypeScript**: No `any` types allowed
- **Server Components**: Default, use `"use client"` only when needed
- **Security**: Never log secrets, validate all inputs
- **Self-documenting**: Extensive JSDoc comments in Spanish
- **Middleware**: Handles auth redirects at edge (middleware.ts)

## Troubleshooting

### Common Issues

**Test database locked:**
```bash
# Remove test database and regenerate
rm medround_test.db
npm run db:test:migrate
```

**Prisma client out of sync:**
```bash
# Regenerate for current environment
npm run db:generate        # For PostgreSQL
npm run db:test:generate   # For SQLite tests
```

**ESLint errors on new files:**
```bash
npm run lint  # Auto-fix most issues
```
