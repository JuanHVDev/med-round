# AGENTS.md - Development Guidelines for med-round

This file contains guidelines and commands for agentic coding agents working in this repository.

## Build Commands

### Testing
No test framework is currently configured in this project.

## Project Structure

This is a Next.js 16 application using the App Router with TypeScript and Tailwind CSS v4.

```
med-round/
├── app/                 # Next.js App Router directory
│   ├── layout.tsx       # Root layout component
│   ├── page.tsx         # Home page component
│   └── globals.css      # Global styles
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── eslint.config.mjs    # ESLint configuration
```

## Code Style Guidelines

### TypeScript & React
- Use TypeScript for all files (.tsx for React components, .ts for utilities)
- Follow strict TypeScript configuration as defined in tsconfig.json
- Use React 19 with the new JSX transform
- Default export for page components, named exports for utilities

### Import Organization
```typescript
// 1. External libraries (React, Next.js, etc.)
import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';

// 2. Internal modules (use @/* alias)
import Component from '@/components/Component';
import './styles.css';
```

### Component Structure
- Use functional components with TypeScript interfaces
- Export components as default when they are page components
- Use proper TypeScript types for props: `Readonly<{ children: React.ReactNode }>`
- Follow the existing naming convention: PascalCase for components

### CSS & Styling
- Use Tailwind CSS v4 classes
- Responsive design with Tailwind breakpoints
- Dark mode support via `prefers-color-scheme`

### ESLint Configuration
- Uses Next.js recommended ESLint configuration
- Includes TypeScript rules and Core Web Vitals
- Custom ignores for build artifacts and Next.js files

### Path Aliases
- Use `@/*` alias for imports from the root directory
- This is configured in tsconfig.json paths

### File Naming
- React components: PascalCase.tsx
- Utilities and types: camelCase.ts
- Styles: globals.css, component-specific styles in same directory

### Error Handling
- Use TypeScript strict mode for type safety
- Proper error boundaries for React components (when needed)
- Async/await with try-catch for API calls

### Performance
- Next.js Image component for optimized images
- Font optimization with next/font/google
- Use React.memo for expensive components when needed

### Git & Development
- This is a private repository
- Commit messages should follow conventional commits when possible
- Always run linting before commits: `npm run lint`

## Environment & Dependencies

### Core Dependencies
- Next.js 16.1.5 (App Router)
- React 19.2.3
- TypeScript 5

### Development Tools
- Tailwind CSS v4 for styling
- ESLint with Next.js configuration
- TypeScript for type safety

### Browser Support
- ES2017 target (configured in tsconfig.json)
- Modern browsers with ES2020+ features

## Best Practices

1. **Components**: Keep components small and focused
2. **Types**: Use TypeScript interfaces for all props and data structures
3. **Styling**: Prefer Tailwind utility classes over custom CSS
4. **Performance**: Use Next.js built-in optimizations (Image, Font, etc.)
5. **Accessibility**: Include proper ARIA labels and semantic HTML
6. **SEO**: Use Next.js metadata API for page metadata

## Notes

- No testing framework currently configured
- Uses Tailwind CSS v4 (latest version)
- Dark mode support built-in
- Font loading optimized with next/font/google
- Follows Next.js 16 best practices and conventions