import { pgTable, uuid, varchar, text, numeric, integer, boolean, date, timestamp, doublePrecision, char } from 'drizzle-orm/pg-core'
import { accounts } from './auth'

// Table des utilisateurs
export const users = pgTable('users', {
  accountId: uuid('account_id').primaryKey().references(() => accounts.id),
  firstName: varchar('first_name', { length: 80 }).notNull(),
  lastName: varchar('last_name', { length: 80 }).notNull(),
  birthDate: date('birth_date'),
  profileMediaId: uuid('profile_media_id') // Référence vers media_files
})

// Table des clubs
export const clubs = pgTable('clubs', {
  accountId: uuid('account_id').primaryKey().references(() => accounts.id),
  clubName: varchar('club_name', { length: 160 }).notNull(),
  description: text('description'),
  rating: numeric('rating', { precision: 2, scale: 1 }).default('0'),
  reviewCount: integer('review_count').default(0),
  isOpen: boolean('is_open').default(true),
  websiteUrl: text('website_url'),
  phone: varchar('phone', { length: 32 }),
  email: varchar('email', { length: 120 }),
  logoMediaId: uuid('logo_media_id') // Référence vers media_files
})

// Table des adresses
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  line1: varchar('line1', { length: 160 }).notNull(),
  line2: varchar('line2', { length: 160 }),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  countryCode: char('country_code', { length: 2 }).notNull().default('FR'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  isPrimary: boolean('is_primary').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Table des préférences de recherche utilisateur
export const userSearchPrefs = pgTable('user_search_prefs', {
  userId: uuid('user_id').primaryKey().references(() => users.accountId),
  baseAddressId: uuid('base_address_id').references(() => addresses.id),
  radiusKm: numeric('radius_km', { precision: 5, scale: 2 }).notNull().default('20.0'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Table des fichiers média
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerAccountId: uuid('owner_account_id').references(() => accounts.id),
  purpose: varchar('purpose', { length: 40 }).notNull(), // PROFILE_PHOTO, CLUB_LOGO, CLUB_PHOTO, EVENT_PHOTO
  storagePath: text('storage_path').notNull(),
  mimeType: varchar('mime_type', { length: 120 }),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
