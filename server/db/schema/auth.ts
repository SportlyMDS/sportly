import { pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { accountTypeEnum, otpChannelEnum } from './enums'

// Tables d'authentification compatibles Better Auth
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(), // Better Auth génère des IDs au format string
  name: text('name').notNull(), // Requis par Better Auth
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false), // Better Auth utilise 'emailVerified'
  image: text('image'), // Champ optionnel pour l'avatar
  phone: varchar('phone', { length: 32 }),

  // Champs personnalisés
  accountType: accountTypeEnum('account_type').notNull(),

  // Authentification locale (NULL si OAuth uniquement)
  password: text('password'), // Better Auth utilise 'password'

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const oauthAccounts = pgTable('oauth_accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  providerId: varchar('provider_id', { length: 40 }), // Optionnel : NULL pour email/password
  providerAccountId: varchar('provider_account_id', { length: 120 }), // Optionnel : NULL pour email/password
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'), // Champ password pour Better Auth
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  sessionToken: text('session_token').notNull().unique(), // Better Auth attend un token de session unique
  ip: varchar('ip', { length: 64 }),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const verificationCodes = pgTable('verification_codes', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  channel: otpChannelEnum('channel').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const passwordResets = pgTable('password_resets', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
