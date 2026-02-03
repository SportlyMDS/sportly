import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { clubs } from '../../db/schema'

const clubOfferSchema = z.object({
  clubId: z.string().min(1, 'ID du club requis'),
  offerType: z.enum(['ESSENTIEL', 'VISIBILITE'], {
    errorMap: () => ({ message: 'Type d\'offre invalide' })
  })
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation avec Zod
  const parseResult = clubOfferSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Données invalides',
      data: parseResult.error.errors
    })
  }

  const { clubId, offerType } = parseResult.data
  const db = useDrizzle()

  try {
    // Vérifier que le club existe
    const existingClub = await db
      .select({ accountId: clubs.accountId })
      .from(clubs)
      .where(eq(clubs.accountId, clubId))
      .limit(1)

    if (existingClub.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Club non trouvé'
      })
    }

    // Mettre à jour l'offre et le statut
    await db
      .update(clubs)
      .set({
        offerType,
        registrationStatus: 'COMPLETED'
      })
      .where(eq(clubs.accountId, clubId))

    return {
      success: true,
      message: 'Offre enregistrée avec succès',
      offerType
    }
  } catch (error: unknown) {
    // Re-throw les erreurs HTTP déjà formatées
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur mise à jour offre:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de l\'offre'
    })
  }
})
