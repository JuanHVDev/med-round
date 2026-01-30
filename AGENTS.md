# AGENTS.md - Development Guidelines for med-round

This file contains guidelines and commands for agentic coding agents working in this repository.

## Build Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000

# Production
npm run build        # Build production application
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint on all files
npm run lint -- --fix  # Auto-fix ESLint issues

# Database (Prisma ORM)
npm run db:generate  # Generate Prisma client after schema changes
npm run db:push      # Push schema changes to database (dev only)
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio GUI
```

### Testing
No test framework is currently configured. To add testing, consider:
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests

## Project Structure

```
med-round/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/[...auth]/   # Better Auth handler
│   │   └── register/         # Registration API
│   ├── (routes)/             # Page routes
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Registration page
│   └── globals.css           # Global styles + Tailwind
├── components/               # React components
│   ├── providers/            # Context providers
│   ├── register/             # Registration form steps
│   └── ui/                   # Reusable UI components (shadcn)
├── lib/                      # Utilities and configs
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── prisma.ts             # Prisma client singleton
│   ├── registerSchema.ts     # Zod validation schemas
│   └── utils.ts              # Utility functions (cn, etc.)
├── prisma/
│   └── schema.prisma         # Prisma database schema
├── stores/                   # Zustand state stores
├── hooks/                    # Custom React hooks
├── constants/                # Constants and configuration
├── middleware.ts             # Next.js middleware
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config
└── eslint.config.mjs         # ESLint config
```

## Code Style Guidelines

### TypeScript & React
- **Strict TypeScript**: Follow `strict: true` in tsconfig.json
- **React 19**: Use new JSX transform (no `import React` needed)
- **Functional Components**: Always use function declarations, not arrow functions
- **Page Components**: Default export, named exports for utilities
- **Props Typing**: Use `Readonly<{ children: React.ReactNode }>` for layouts
- **Never use `any`**: Strict null checks enabled, always type properly

### Import Organization
```typescript
// 1. External libraries
import * as React from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// 2. Internal modules (use @/* alias)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 3. Relative imports (only when necessary)
import { prisma } from "../lib/prisma";

// 4. Types
import type { Metadata } from "next";
```

### Naming Conventions
- **Components**: PascalCase (e.g., `Button.tsx`, `AuthProvider.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `registerSchema.ts`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **API Routes**: lowercase with dashes (e.g., `[...auth]/route.ts`)
- **Database Models**: PascalCase in Prisma schema, camelCase in code

### Component Patterns
```typescript
// UI Components (shadcn style)
import * as React from "react";

function Button({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) {
  return (
    <button className={cn(buttonVariants({ className }))} {...props} />
  );
}

// Server Components (pages)
export default async function Page() {
  // Async data fetching
}

// Client Components (interactivity)
"use client";

export function ClientComponent() {
  const [state, setState] = useState();
  // Client-side logic
}
```

### Styling (Tailwind CSS v4)
- Use `@import "tailwindcss"` in globals.css
- Component variants via `class-variance-authority` (cva)
- Merge classes with `cn()` utility from `@/lib/utils`
- Use CSS variables for theming (defined in globals.css)

### Database (Prisma ORM)
- **Schema**: Define in `prisma/schema.prisma`
- **Relations**: Use proper foreign key relations
- **Client**: Use singleton pattern in `lib/prisma.ts`
- **Migrations**: Create with `db:migrate`, push dev changes with `db:push`
- **Studio**: Use `db:studio` to view/edit data

### Authentication (Better Auth)
- **Server Config**: `lib/auth.ts` - configure Better Auth with Prisma adapter
- **Client**: `lib/auth-client.ts` - export client for React components
- **Handler**: `app/api/auth/[...auth]/route.ts` - API route handler
- **Provider**: `components/providers/AuthProvider.tsx` - React context wrapper
- **Protected Routes**: Check session in middleware or use `useSession()` hook

### Error Handling
- Use TypeScript strict mode for compile-time safety
- Wrap async operations in try-catch with proper error messages
- Use Zod for runtime validation
- Return proper HTTP status codes in API routes (400, 409, 500)
- Always log errors server-side with console.error

### Form Handling
- Use `react-hook-form` with Zod resolvers
- Validation schemas in `lib/registerSchema.ts`
- Multi-step forms use step components in `components/register/`

### Performance
- Server Components by default, "use client" only when needed
- Use Next.js Image component for optimized images
- Font optimization with `next/font/google`

### Git Workflow
- Run `npm run lint` before committing
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits focused and atomic

## Environment Variables

Required environment variables (in `.env`):
```
DATABASE_URL=postgresql://... (Neon connection string)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Dependencies

### Core
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)

### Database & Auth
- Prisma + @prisma/client
- Better Auth

### UI & Styling
- Tailwind CSS v4
- Radix UI primitives
- Lucide React icons
- class-variance-authority

### Forms & Validation
- react-hook-form
- @hookform/resolvers
- Zod

### State Management
- Zustand

## Important Notes

- **Spanish language**: UI is in Spanish (lang="es" in layout)
- **Medical domain**: App is for medical professionals (medicos)
- **Better Auth**: Configured with email/password, 7-day sessions
- **Database**: PostgreSQL on Neon with custom `medicos_profile` table
- **Dark mode**: Supported via CSS variables and Tailwind
- **Strict TypeScript**: No `any` types, strict null checks enabled
- **No test framework**: Consider adding Vitest + Playwright
