// Export de tous les schémas Drizzle pour Sportly
export * from './enums'
export * from './auth'
export * from './email-verification'
export * from './users'
export * from './sports'
export * from './events'
export * from './system'

// Relations entre les tables (optionnel, pour les requêtes complexes)
import { relations } from 'drizzle-orm'
import { users, clubs, addresses, mediaFiles } from './users'
import { accounts, sessions, oauthAccounts, verificationCodes, passwordResets } from './auth'

// Relations pour les comptes
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.id],
    references: [users.accountId]
  }),
  club: one(clubs, {
    fields: [accounts.id],
    references: [clubs.accountId]
  }),
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
  verificationCodes: many(verificationCodes),
  passwordResets: many(passwordResets),
  addresses: many(addresses),
  mediaFiles: many(mediaFiles)
}))

// Relations pour les utilisateurs
export const usersRelations = relations(users, ({ one }) => ({
  account: one(accounts, {
    fields: [users.accountId],
    references: [accounts.id]
  }),
  profileMedia: one(mediaFiles, {
    fields: [users.profileMediaId],
    references: [mediaFiles.id]
  })
}))

// Relations pour les clubs
export const clubsRelations = relations(clubs, ({ one }) => ({
  account: one(accounts, {
    fields: [clubs.accountId],
    references: [accounts.id]
  }),
  logoMedia: one(mediaFiles, {
    fields: [clubs.logoMediaId],
    references: [mediaFiles.id]
  })
}))
