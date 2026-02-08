# AGENTS.md - Development Guidelines for med-round

## Build, Test & Development Commands

```bash
# Development
npm run dev                 # Start Next.js dev server on http://localhost:3000
npm run build               # Build production application
npm run start               # Start production server
npm run lint                # Run ESLint with auto-fix
npm run analyze             # Bundle analysis

# Testing (Vitest)
npm run test                # Run tests in watch mode
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage report
npm run test:run            # Run all tests once (CI mode)
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
npm run test:e2e            # Run E2E tests with Playwright
npm run test:e2e:ui         # Run E2E tests with Playwright UI

# Single test commands
npx vitest run tests/services/handover/handoverService.test.ts  # Single file
npx vitest run -t "should create handover"                      # Single test by name

# Database (PostgreSQL for dev/prod, SQLite for tests)
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Create and run migrations
npm run db:push             # Push schema changes (dev only)
npm run db:studio           # Open Prisma Studio GUI
```

## Project Structure

```
app/                        # Next.js 16 App Router (pages, layouts, API)
components/                 # React components (ui/, forms/, patients/, soap/, tasks/, handover/)
lib/                        # Utilities (auth.ts, prisma.ts, errors.ts, rate-limit.ts, utils.ts)
services/                   # Business logic layer (patient/, soap/, tasks/, handover/)
stores/                     # Zustand state stores
hooks/                      # Custom React hooks
tests/                      # Test suites (services/, lib/, integration/)
prisma/                     # schema.prisma (PostgreSQL), schema.test.prisma (SQLite)
```

## TypeScript & Code Style

### Import Order
1. External libraries (`next/server`, `react`)
2. Internal modules (`@/lib/utils`, `@/components/...`)
3. Type imports (`import type`)

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `HandoverBuilder.tsx`)
- **Files/Folders**: camelCase (`utils.ts`, `handoverService.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase
- **API Routes**: lowercase (`route.ts`)

### Formatting Rules
- Double quotes, no semicolons, 2 spaces indentation, max 100 chars/line
- **Never use `any`** - strict TypeScript enforced
- Use `cn()` utility for Tailwind class merging

## Component Patterns

### Server Component (default)
```typescript
export default async function Page() { return <div>Content</div>; }
```

### Client Component
```typescript
"use client";
import { useState } from "react";
export function ClientComponent() { const [state, setState] = useState(); }
```

### UI Component (shadcn/ui style)
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn(/* classes */)} {...props} />;
}
```

## Testing Guidelines (TDD)

### Test Structure (AAA Pattern)
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFns = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: () => mockFns } }));

import { functionToTest } from "@/lib/module";

describe("Feature Name", () => {
  beforeEach(() => vi.clearAllMocks());
  it("should do something", async () => {
    mockFns.get.mockResolvedValue(0);
    const result = await functionToTest();
    expect(result.allowed).toBe(true);
  });
});
```

### Test Categories
- **Unit tests**: Mock external deps (Redis, DB, email)
- **Integration tests**: Real SQLite database
- **E2E tests**: Playwright for full user flows

## Error Handling

```typescript
import { ErrorCodes, ZodValidationError, RateLimitError } from "@/lib/errors";

try {
  // logic
} catch (error) {
  if (error instanceof ZodValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error("Error:", error);
  return NextResponse.json({ error: "Error interno", code: ErrorCodes.INTERNAL_ERROR }, { status: 500 });
}
```

**HTTP Status Codes**: 400 (validation), 401 (unauthorized), 403 (forbidden), 409 (conflict), 429 (rate limit), 500 (internal)

## Database & Auth Patterns

```typescript
import { prisma } from "@/lib/prisma";
const user = await prisma.user.findUnique({ where: { id } });

import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: request.headers });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

import { checkRateLimit } from "@/lib/rate-limit";
const rateLimit = await checkRateLimit(`action:${ip}`);
```

## Key Conventions

- **Spanish UI**: All user-facing text in Spanish
- **Server Components**: Default, use `"use client"` only when needed
- **Security**: Never log secrets, validate all inputs
- **Comments**: Technical in English, user text in Spanish
- **Git**: Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`)

## Troubleshooting

```bash
# Test database locked
rm medround_test.db && npm run db:generate && npx vitest run tests/integration
# Prisma client out of sync
npm run db:generate && npm run db:push
```
