import { pgTable, uuid, varchar, text, timestamp, numeric, integer } from 'drizzle-orm/pg-core'
import { accounts } from './auth'
import { addresses } from './users'
import { sports } from './sports'
import { eventTypeEnum } from './enums'

// Table des événements
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id').notNull().references(() => accounts.id), // club ou user
  eventType: eventTypeEnum('event_type').notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  addressId: uuid('address_id').references(() => addresses.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  levelRequired: varchar('level_required').array().notNull(), // array de sport_level
  audience: varchar('audience').array().notNull(), // array de target_audience
  accessibility: varchar('accessibility').array(), // ex: {HANDISPORT, MIXTE}
  paymentProvider: varchar('payment_provider', { length: 40 }), // STRIPE, PAYPAL
  price: numeric('price', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow()
})

// Table de liaison événements-sports
export const eventSports = pgTable('event_sports', {
  eventId: uuid('event_id').notNull().references(() => events.id),
  sportId: integer('sport_id').notNull().references(() => sports.id)
})

// Table des photos d'événements
export const eventPhotos = pgTable('event_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  mediaId: uuid('media_id').notNull(), // Référence vers media_files
  createdAt: timestamp('created_at').defaultNow()
})

// Table des participants aux événements
export const eventParticipants = pgTable('event_participants', {
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull(), // Référence vers users.account_id
  status: varchar('status', { length: 20 }).notNull().default('REGISTERED'), // REGISTERED / CANCELLED / ATTENDED
  registeredAt: timestamp('registered_at').defaultNow()
})

// Table des paiements d'événements
export const eventPayments = pgTable('event_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull(), // Référence vers users.account_id
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  provider: varchar('provider', { length: 40 }).notNull(), // STRIPE
  providerPaymentId: text('provider_payment_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // PAID / FAILED / REFUNDED
  createdAt: timestamp('created_at').defaultNow()
})
