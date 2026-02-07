# AGENTS.md - Development Guidelines for med-round

## Build, Test & Development Commands

```bash
# Development
npm run dev                 # Start Next.js dev server on http://localhost:3000
npm run build               # Build production application
npm run start               # Start production server
npm run lint                # Run ESLint with auto-fix

# Testing (Vitest)
npm run test                # Run tests in watch mode
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage report
npm run test:run            # Run all tests once (CI mode)
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only

# Single test commands
npx vitest run tests/services/handover/handoverService.test.ts  # Single file
npx vitest run -t "should create handover"                      # Single test by name
npx vitest run tests/services --reporter=verbose               # With verbose output

# Database (PostgreSQL for dev/prod, SQLite for tests)
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Create and run migrations (interactive)
npm run db:push             # Push schema changes (dev only)
npm run db:studio           # Open Prisma Studio GUI

# Test database commands
npm run db:test:generate    # Generate Prisma client for SQLite tests
npm run db:test:migrate     # Run migrations on test database
```

## Project Structure

```
app/                        # Next.js 16 App Router
├── api/                    # API routes (route.ts files)
├── (routes)/               # Page routes (grouped routes)
├── layout.tsx              # Root layout
└── globals.css             # Tailwind CSS v4 imports

components/                 # React components
├── ui/                     # shadcn/ui components
├── providers/              # Context providers
├── forms/                  # Form components
├── patients/               # Patient-specific components
├── soap/                   # SOAP note components
├── tasks/                  # Task/Kanban components
└── handover/               # Handover components

lib/                        # Utilities and configurations
├── auth.ts                 # Better Auth server config
├── auth-client.ts          # Better Auth client
├── prisma.ts               # Prisma singleton client
├── errors.ts               # Custom error classes
├── rate-limit.ts           # Redis rate limiting
├── email.ts                # Email service
└── utils.ts                # cn() utility

services/                   # Business logic layer
├── patient/                # Patient CRUD services
├── soap/                   # SOAP note services
├── tasks/                  # Task management services
├── handover/               # Handover services (Fase 5)
└── types/                  # Service type definitions

stores/                     # Zustand state stores
hooks/                      # Custom React hooks
tests/                      # Test suites
├── services/               # Unit tests for services
├── lib/                    # Unit tests for lib/
├── integration/            # Integration tests
├── setup.ts                # Vitest setup (runs before each file)
└── global-setup.ts         # Global setup (runs once)

prisma/
├── schema.prisma           # PostgreSQL schema (production)
└── schema.test.prisma      # SQLite schema (testing)
```

## TypeScript & Code Style

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
- **Components**: PascalCase (`Button.tsx`, `HandoverBuilder.tsx`)
- **Files/Folders**: camelCase (`utils.ts`, `handoverService.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Database Models**: PascalCase in Prisma, camelCase in code
- **API Routes**: lowercase (`route.ts`)
- **Variables/Functions**: camelCase

### Formatting Rules
- **Double quotes** enforced by ESLint
- No semicolons (Next.js default)
- 2 spaces indentation
- Max 100 characters per line
- **Never use `any`** - strict TypeScript enforced

## Component Patterns

### Server Component (default)
```typescript
export default async function Page() {
  return <div>Content</div>;
}
```

### Client Component
```typescript
"use client";
import { useState } from "react";
export function ClientComponent() {
  const [state, setState] = useState();
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

## Testing Guidelines (TDD Approach)

### Test Structure (AAA Pattern)
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external modules with vi.hoisted
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

### Test Categories
- **Unit tests**: Mock external dependencies (Redis, DB, email)
- **Integration tests**: Test API routes with real SQLite database
- **E2E tests**: Full user flows (minimal, use sparingly)

### TDD Workflow
1. Write tests first (tests should fail)
2. Implement minimal code to make tests pass
3. Refactor if needed
4. Run `npm run lint` before committing

## Error Handling

### Custom Error Classes (lib/errors.ts)
```typescript
import { ErrorCodes, ZodValidationError, RateLimitError } from "@/lib/errors";

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
- `401` - Unauthorized (no session)
- `403` - Forbidden (no permission)
- `409` - Conflict (duplicate user)
- `429` - Rate limit exceeded
- `500` - Internal server error

## Database & Auth Patterns

### Prisma Singleton
```typescript
import { prisma } from "@/lib/prisma";
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

## Key Conventions

- **Spanish UI**: All user-facing text in Spanish (`lang="es"`)
- **Medical Domain**: App for medical professionals
- **Server Components**: Default, use `"use client"` only when needed
- **Security**: Never log secrets, validate all inputs
- **Comments**: Technical comments in English, user text in Spanish
- **Git**: Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`)
- **Styling**: Tailwind CSS v4 with `cn()` utility from `@/lib/utils`

## Troubleshooting

**Test database locked:**
```bash
rm medround_test.db && npm run db:test:migrate
```

**Prisma client out of sync:**
```bash
npm run db:generate        # For PostgreSQL
npm run db:test:generate   # For SQLite tests
```

**ESLint errors:**
```bash
npm run lint  # Auto-fix most issues
```
