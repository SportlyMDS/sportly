import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { clubs, addresses } from '../../db/schema'
import { serverAuth } from '../../utils/auth'

const updateClubSchema = z.object({
  clubName: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  isOpen: z.boolean().optional(),
  sports: z.array(z.string()).min(1).optional(),
  address: z.object({
    line1: z.string().min(5).optional(),
    line2: z.string().optional(),
    postalCode: z.string().regex(/^\d{5}$/).optional(),
    city: z.string().min(2).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID du club requis'
    })
  }

  // Vérifier l'authentification
  const session = await serverAuth().api.getSession({
    headers: event.headers
  })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentification requise'
    })
  }

  // Vérifier que l'utilisateur est bien le propriétaire du club
  if (session.user.id !== id) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'êtes pas autorisé à modifier ce club'
    })
  }

  const body = await readBody(event)

  const parseResult = updateClubSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Données invalides',
      data: parseResult.error.errors
    })
  }

  const data = parseResult.data
  const db = useDrizzle()

  try {
    // Vérifier que le club existe
    const existingClub = await db
      .select({ accountId: clubs.accountId })
      .from(clubs)
      .where(eq(clubs.accountId, id))
      .limit(1)

    if (existingClub.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Club non trouvé'
      })
    }

    // Mettre à jour les infos du club
    const { address: addressData, ...clubData } = data

    if (Object.keys(clubData).length > 0) {
      await db
        .update(clubs)
        .set(clubData)
        .where(eq(clubs.accountId, id))
    }

    // Mettre à jour l'adresse si fournie
    if (addressData && Object.keys(addressData).length > 0) {
      await db
        .update(addresses)
        .set(addressData)
        .where(eq(addresses.accountId, id))
    }

    // Retourner le club mis à jour
    const updatedClub = await db
      .select()
      .from(clubs)
      .where(eq(clubs.accountId, id))
      .limit(1)

    return {
      success: true,
      message: 'Club mis à jour avec succès',
      data: updatedClub[0]
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur mise à jour club:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour du club'
    })
  }
})
