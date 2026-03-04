/**
 * Seed script — insère un club factice complet pour tester /clubs/:id
 * Lancer avec : pnpm db:seed
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import * as schema from './schema/index.js'

const { Pool } = pg

const CLUB_ID = 'seed-club-test-001'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle({ client: pool, schema })

async function seed() {
  console.log('🌱 Seeding club factice…')

  // ── Nettoyage (idempotent) ─────────────────────────────────────────────────
  await db.delete(schema.clubReviews).where(eq(schema.clubReviews.clubId, CLUB_ID))
  await db.delete(schema.clubOpeningHours).where(eq(schema.clubOpeningHours.clubId, CLUB_ID))
  await db.delete(schema.clubFacilities).where(eq(schema.clubFacilities.clubId, CLUB_ID))
  await db.delete(schema.clubSports).where(eq(schema.clubSports.clubId, CLUB_ID))
  await db.delete(schema.addresses).where(eq(schema.addresses.accountId, CLUB_ID))
  await db.delete(schema.clubs).where(eq(schema.clubs.accountId, CLUB_ID))
  await db.delete(schema.accounts).where(eq(schema.accounts.id, CLUB_ID))

  // ── 1. Account ────────────────────────────────────────────────────────────
  await db.insert(schema.accounts).values({
    id: CLUB_ID,
    name: 'Lille Université Club',
    email: 'seed-club@sportly.dev',
    emailVerified: true,
    accountType: 'CLUB',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // ── 2. Club ───────────────────────────────────────────────────────────────
  await db.insert(schema.clubs).values({
    accountId: CLUB_ID,
    clubName: 'Lille Université Club',
    description: 'Club sportif universitaire proposant une grande variété d\'activités pour tous les niveaux. Situé au cœur du campus, nous accueillons étudiants et habitants du quartier dans une ambiance conviviale.',
    rating: '4.3',
    reviewCount: 2,
    isOpen: true,
    websiteUrl: 'https://example.com',
    phone: '+33612345678',
    email: 'contact@luc.fr',
    offerType: 'VISIBILITE',
    registrationStatus: 'COMPLETED',
    adminFirstName: 'Jean',
    adminLastName: 'Dupont'
  })

  // ── 3. Adresse ────────────────────────────────────────────────────────────
  await db.insert(schema.addresses).values({
    accountId: CLUB_ID,
    line1: '42 Avenue de l\'Université',
    postalCode: '59000',
    city: 'Lille',
    latitude: 50.6374,
    longitude: 3.0701,
    isPrimary: true
  })

  // ── 4. Sports de référence (upsert) ───────────────────────────────────────
  const sportsToInsert = [
    { code: 'FOOTBALL', label: 'Football', emoji: '⚽' },
    { code: 'NATATION', label: 'Natation', emoji: '🏊' },
    { code: 'MUSCULATION', label: 'Musculation', emoji: '💪' }
  ]

  const sportIds: Record<string, number> = {}
  for (const s of sportsToInsert) {
    const existing = await db.select().from(schema.sports).where(eq(schema.sports.code, s.code)).limit(1)
    if (existing[0]) {
      sportIds[s.code] = existing[0].id
    }
    else {
      const [row] = await db.insert(schema.sports).values(s).returning({ id: schema.sports.id })
      sportIds[s.code] = row.id
    }
  }

  // ── 5. Sports du club ─────────────────────────────────────────────────────
  await db.insert(schema.clubSports).values([
    {
      clubId: CLUB_ID,
      sportId: sportIds.FOOTBALL!,
      levelsAccepted: ['DEBUTANT', 'INTERMEDIAIRE'],
      audiences: ['ADULTES', 'ADOS']
    },
    {
      clubId: CLUB_ID,
      sportId: sportIds.NATATION!,
      levelsAccepted: ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'],
      audiences: ['TOUS']
    },
    {
      clubId: CLUB_ID,
      sportId: sportIds.MUSCULATION!,
      levelsAccepted: ['INTERMEDIAIRE', 'AVANCE', 'PRO'],
      audiences: ['ADULTES', 'SENIORS']
    }
  ])

  // ── 6. Équipements ────────────────────────────────────────────────────────
  await db.insert(schema.clubFacilities).values([
    { clubId: CLUB_ID, facility: 'VESTIAIRES' },
    { clubId: CLUB_ID, facility: 'TOILETTES' },
    { clubId: CLUB_ID, facility: 'HANDICAP_FRIENDLY' }
  ])

  // ── 7. Horaires (DIM absent → affiche "—") ────────────────────────────────
  await db.insert(schema.clubOpeningHours).values([
    { clubId: CLUB_ID, dayOfWeek: 'LUN', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { clubId: CLUB_ID, dayOfWeek: 'MAR', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { clubId: CLUB_ID, dayOfWeek: 'MER', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { clubId: CLUB_ID, dayOfWeek: 'JEU', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '20:00' },
    { clubId: CLUB_ID, dayOfWeek: 'VEN', morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '14:00', afternoonClose: '18:00' },
    { clubId: CLUB_ID, dayOfWeek: 'SAM', morningOpen: '10:00', morningClose: '13:00', afternoonOpen: null, afternoonClose: null }
  ])

  // ── 8. Avis ───────────────────────────────────────────────────────────────
  await db.insert(schema.clubReviews).values([
    {
      clubId: CLUB_ID,
      userId: 'fake-user-1',
      rating: 5,
      comment: 'Super club, ambiance top et coachs très disponibles !'
    },
    {
      clubId: CLUB_ID,
      userId: 'fake-user-2',
      rating: 4,
      comment: 'Très bon club, installations propres. Manque juste un peu de créneaux le weekend.'
    }
  ])

  console.log(`\n✅ Seed terminé — Club ID : ${CLUB_ID}`)
  console.log(`   → http://localhost:3000/clubs/${CLUB_ID}\n`)

  await pool.end()
}

seed().catch((e) => {
  console.error('❌ Erreur seed :', e)
  pool.end()
  process.exit(1)
})
