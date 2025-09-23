import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { accounts } from './auth'
import { clubs } from './users'

// Table des abonnements
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  planCode: varchar('plan_code', { length: 40 }).notNull(), // ESSENTIEL, PRO...
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endsAt: timestamp('ends_at'),
  isActive: boolean('is_active').notNull().default(true)
})

// Table des salles de club
export const clubRooms = pgTable('club_rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => clubs.accountId),
  name: varchar('name', { length: 120 }).notNull(),
  photoMediaId: uuid('photo_media_id'), // Référence vers media_files
  roomType: varchar('room_type', { length: 40 }), // intérieur, extérieur...
  capacity: integer('capacity'),
  schedule: text('schedule'), // considérer JSONB en app
  address: text('address')
})

// Table des notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id),
  title: varchar('title', { length: 160 }).notNull(),
  body: text('body'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

// Table des favoris utilisateur
export const userFavorites = pgTable('user_favorites', {
  userId: uuid('user_id').notNull(), // Référence vers users.account_id
  targetType: varchar('target_type', { length: 20 }).notNull(), // CLUB / EVENT
  targetId: uuid('target_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// Table des connexions utilisateur
export const userConnections = pgTable('user_connections', {
  userId: uuid('user_id').notNull(), // Référence vers users.account_id
  partnerId: uuid('partner_id').notNull(), // Référence vers users.account_id
  status: varchar('status', { length: 20 }).notNull().default('PENDING'), // PENDING / ACCEPTED / BLOCKED
  createdAt: timestamp('created_at').defaultNow()
})

// Table des logs admin
export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => accounts.id),
  action: varchar('action', { length: 80 }).notNull(),
  targetType: varchar('target_type', { length: 20 }),
  targetId: uuid('target_id'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow()
})

// Table des signalements
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => accounts.id),
  targetType: varchar('target_type', { length: 20 }).notNull(), // CLUB / EVENT / USER
  targetId: uuid('target_id').notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('OPEN'), // OPEN / REVIEWING / CLOSED
  createdAt: timestamp('created_at').defaultNow()
})
