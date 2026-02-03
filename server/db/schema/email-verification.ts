import { pgTable, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core'

// Table pour les vérifications d'email avant création de compte
// Stocke les OTP de manière sécurisée avec hash et rate limiting
export const emailVerifications = pgTable('email_verifications', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  codeHash: text('code_hash').notNull(), // Hash SHA-256 du code OTP
  attempts: integer('attempts').notNull().default(0), // Nombre de tentatives (max 5)
  expiresAt: timestamp('expires_at').notNull(),
  verifiedAt: timestamp('verified_at'), // NULL si pas encore vérifié
  createdAt: timestamp('created_at').notNull().defaultNow()
})
