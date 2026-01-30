-- Migration: Rename camelCase columns to snake_case for Better Auth compatibility
-- This fixes the PostgreSQL case-sensitivity issue

-- Rename columns in users table
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in sessions table
ALTER TABLE "sessions" RENAME COLUMN "sessionToken" TO "session_token";
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "sessions" RENAME COLUMN "createdAt" TO "created_at";

-- Rename columns in accounts table
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";

-- Rename columns in verifications table
ALTER TABLE "verifications" RENAME COLUMN "createdAt" TO "created_at";

-- Update foreign key constraint names
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_users_id_fk";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_users_id_fk";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Update unique constraint name for sessions
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_sessionToken_unique";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token");
