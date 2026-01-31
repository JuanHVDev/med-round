# AGENTS.md - Development Guidelines for med-round

## Build Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000
npm run build        # Build production application
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint on all files
npm run lint -- --fix  # Auto-fix ESLint issues

# Database (Prisma)
npm run db:generate  # Generate Prisma client after schema changes
npm run db:push      # Push schema changes to database (dev only)
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio GUI
```

## Project Structure

```
app/                  # Next.js App Router
├── api/              # API routes (route.ts)
├── login/            # Login page
├── register/         # Registration page
components/           # React components
├── register/         # Registration form steps
├── ui/               # shadcn/ui components
├── providers/        # Context providers
lib/                  # Utilities and configs
├── auth.ts           # Better Auth server config
├── auth-client.ts    # Better Auth client
├── prisma.ts         # Prisma client singleton
├── utils.ts          # Utility functions (cn)
├── registerSchema.ts # Zod validation schemas
stores/               # Zustand state stores
hooks/                # Custom React hooks
constants/            # Constants
prisma/schema.prisma  # Database schema
```

## TypeScript & React

- **Strict TypeScript**: `strict: true` in tsconfig.json
- **React 19**: Use new JSX transform (no `import React`)
- **Components**: Use function declarations, not arrow functions
- **Types**: Import types with `import type { ... }` for better tree-shaking
- **Never use `any`**: Always type properly with strict null checks

### Import Organization

```typescript
// 1. External libraries
import { NextRequest, NextResponse } from 'next/server';
import type { Metadata } from 'next';

// 2. Internal modules (@/* alias)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 3. Types (import type)
import type { FormData } from '@/lib/registerSchema';
```

## Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`)
- **Files/Folders**: camelCase (e.g., `utils.ts`, `registerSchema.ts`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Database Models**: PascalCase in Prisma, camelCase in code
- **API Routes**: lowercase (e.g., `route.ts`)

## Component Patterns

```typescript
// Server Component (default)
export default async function Page() {
  // Async data fetching
}

// Client Component
"use client";

export function ClientComponent() {
  // Client-side logic
}

// UI Component (shadcn style)
import * as React from "react";

function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn(...)} {...props} />;
}
```

## Error Handling

- Wrap async operations in try-catch
- Use Zod for runtime validation
- Return proper HTTP status codes (400, 409, 500)
- Log errors with `console.error`
- Never expose internal errors to client

## Database & Auth

- **Prisma**: Use singleton pattern in `lib/prisma.ts`
- **Better Auth**: Configured with email/password, 7-day sessions
- **Profile**: Custom `medicos_profile` table extends user data
- **Rate Limiting**: IP-based limiting on auth endpoints

## Styling

- **Tailwind CSS v4**: Use `@import "tailwindcss"` in globals.css
- **Component variants**: Use `class-variance-authority` (cva)
- **Class merging**: Use `cn()` utility from `@/lib/utils`
- **CSS variables**: Use for theming (defined in globals.css)

## Form Handling

- Use `react-hook-form` with Zod resolvers
- Validation schemas in `lib/registerSchema.ts`
- Multi-step forms use step components in `components/register/`
- Form state persists via Zustand + localStorage

## State Management

- **Zustand**: For global state with persistence
- Use `persist` middleware for localStorage
- Export stores from `@/stores/registrationStore`
- Access via custom hooks in `hooks/useRegistrationStore.ts`

## API Patterns

```typescript
// Route Handler (app/api/example/route.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validation + Logic
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

## Git Workflow

- Run `npm run lint` before committing
- Follow conventional commits: `feat:`, `fix:`, `refactor:`
- Keep commits focused and atomic
- Never commit secrets or `.env` files

## Environment Variables

```bash
DATABASE_URL=postgresql://...           # Neon connection
BETTER_AUTH_SECRET=your-secret-key      # Auth secret
BETTER_AUTH_URL=http://localhost:3000   # Server URL
NEXT_PUBLIC_BETTER_AUTH_URL=...         # Client URL
```

## Important Notes

- **Spanish UI**: All text in Spanish (lang="es")
- **Medical Domain**: App for medical professionals
- **Strict TypeScript**: No `any` types
- **Server Components**: Default, use "use client" only when needed
- **No comments**: Code should be self-documenting
- **Security**: Never log secrets, validate all inputs
