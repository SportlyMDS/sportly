# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sportly is a French-language sports platform connecting enthusiasts with clubs and events. Built with Nuxt 4 (Vue 3), Better Auth, Drizzle ORM (PostgreSQL), and Nuxt UI.

## Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000

# Code quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues

# Database (Drizzle ORM)
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio at http://localhost:4983

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build
```

## Architecture

### Multi-Tenant Authentication
- Two account types: `USER` and `CLUB` (stored in `accounts.accountType`)
- Better Auth handles sessions with email/password authentication
- Server auth: `server/utils/auth.ts` - uses `serverAuth()` singleton
- Client auth: `app/composables/useAuth.ts` - provides `session`, `user`, `signIn`, `signUp`, `signOut`
- Route protection via middleware: `auth.ts` (requires login), `guest.ts` (blocks if logged in)

### Database Schema (Drizzle ORM)
Schema files in `server/db/schema/`:
- `auth.ts` - accounts, sessions, oauth_accounts, verification_codes, password_resets
- `users.ts` - users, clubs, addresses, mediaFiles, user_search_prefs
- `sports.ts` - sports, clubSports, clubFacilities, clubOpeningHours
- `events.ts` - events, eventSports, eventPhotos, eventParticipants, eventPayments
- `system.ts` - subscriptions, notifications, userFavorites, adminLogs
- `enums.ts` - PostgreSQL enums (account_type, event_type, sport_level, etc.)

Key relationships:
- `accounts` → `users` or `clubs` (1:1 based on accountType)
- `clubs` → `clubSports` → `sports` (many-to-many)
- `events` → `eventParticipants` → `accounts` (many-to-many)

### API Routes
Located in `server/api/`. Nitro file-based routing with `[name].[method].ts` convention:
- `auth/[...all].ts` - Better Auth catch-all handler
- `auth/signup.post.ts`, `auth/send-otp.post.ts`, `auth/verify-otp.post.ts` - Registration flow
- `clubs/index.post.ts`, `clubs/offer.post.ts` - Club management
- Input validation uses Zod schemas

### Frontend Structure
- `app/pages/` - File-based routing (Nuxt convention)
- `app/components/inscription/` - Multi-step registration forms (particulier/, club/)
- `app/composables/` - State management via composables (no Pinia)
  - `useInscriptionClub.ts`, `useInscriptionParticulier.ts` - Registration form state
- `app/layouts/default.vue` - Main layout with navigation

### UI & Styling
- Nuxt UI v4 components with custom "Tango" orange theme (#ef781e)
- Custom icons in `app/assets/icons/` (prefix: `sportly:`)
- TailwindCSS utilities

### Services
- `server/services/email.ts` - Email service via Resend (welcome, verification, password reset)
- `server/utils/drizzle.ts` - Database connection singleton
- `server/utils/resend.ts` - Resend client initialization

## Key Patterns

### Registration Flow
Multi-step forms store state in composables and sync step number to URL query params for navigation. Steps progress: profile type → personal info → verification → completion.

### Database Access
```typescript
import { useDrizzle } from '~/server/utils/drizzle'
const db = useDrizzle()
await db.select().from(accounts).where(eq(accounts.email, email))
```

### Auth in API Routes
```typescript
import { serverAuth } from '~/server/utils/auth'
const session = await serverAuth().api.getSession({ headers: event.headers })
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Base URL (defaults to localhost:3000 in dev)
- `RESEND_API_KEY` - Email service API key
