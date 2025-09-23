import { pgTable, uuid, varchar, text, serial, integer, time, timestamp, date } from 'drizzle-orm/pg-core'
import { clubs } from './users'
import { facilityTypeEnum, weekdayEnum } from './enums'

// Table des sports (référence)
export const sports = pgTable('sports', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 40 }).notNull().unique(),
  label: varchar('label', { length: 80 }).notNull(),
  emoji: varchar('emoji', { length: 8 })
})

// Table des sports proposés par les clubs
export const clubSports = pgTable('club_sports', {
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  sportId: integer('sport_id').notNull().references(() => sports.id),
  levelsAccepted: varchar('levels_accepted').array(), // array de sport_level
  audiences: varchar('audiences').array() // array de target_audience
})

// Table des équipements/accessibilité des clubs
export const clubFacilities = pgTable('club_facilities', {
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  facility: facilityTypeEnum('facility').notNull()
})

// Table des horaires d'ouverture des clubs
export const clubOpeningHours = pgTable('club_opening_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  dayOfWeek: weekdayEnum('day_of_week').notNull(),
  morningOpen: time('morning_open'),
  morningClose: time('morning_close'),
  afternoonOpen: time('afternoon_open'),
  afternoonClose: time('afternoon_close')
})

// Table des exceptions d'horaires des clubs
export const clubOpeningExceptions = pgTable('club_opening_exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  dateCovered: date('date_covered').notNull(),
  openTime: time('open_time'),
  closeTime: time('close_time'),
  note: text('note')
})

// Table des photos des clubs
export const clubPhotos = pgTable('club_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  mediaId: uuid('media_id').notNull(), // Référence vers media_files
  createdAt: timestamp('created_at').defaultNow()
})

// Table des avis sur les clubs
export const clubReviews = pgTable('club_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  userId: uuid('user_id').notNull(), // Référence vers users.account_id
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow()
})
