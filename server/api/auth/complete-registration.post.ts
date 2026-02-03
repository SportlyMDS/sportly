import { z } from 'zod'
import { eq, and, isNotNull } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { emailVerifications, users, addresses, userSearchPrefs } from '../../db/schema'
import { auth } from '../../utils/auth'
import { sendWelcomeEmail } from '../../services/email'

const completeRegistrationSchema = z.object({
  verificationId: z.string().min(1, 'ID de vérification requis'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  address: z.string().min(5, 'Adresse requise'),
  latitude: z.number(),
  longitude: z.number(),
  searchRadius: z.number().min(1).max(100).default(10)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = completeRegistrationSchema.parse(body)

  const db = useDrizzle()

  try {
    // 1. Vérifier que l'email a bien été vérifié
    const verifications = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.id, validatedData.verificationId),
          isNotNull(emailVerifications.verifiedAt)
        )
      )
      .limit(1)

    if (verifications.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Vérification d\'email invalide ou expirée. Veuillez recommencer l\'inscription.'
      })
    }

    const verification = verifications[0]
    const email = verification.email

    // 2. Créer le compte avec Better Auth
    const name = `${validatedData.firstName} ${validatedData.lastName}`
    const signUpResult = await auth().api.signUpEmail({
      body: {
        email,
        password: validatedData.password,
        name
      }
    })

    if (!signUpResult || !signUpResult.user) {
      throw createError({
        statusCode: 400,
        message: 'Échec de la création du compte'
      })
    }

    const accountId = signUpResult.user.id

    // 3. Créer l'entrée dans la table users
    await db.insert(users).values({
      accountId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName
    })

    // 4. Créer l'adresse principale
    const [newAddress] = await db.insert(addresses).values({
      accountId,
      line1: validatedData.address,
      postalCode: '',
      city: '',
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      isPrimary: true
    }).returning()

    // 5. Créer les préférences de recherche
    await db.insert(userSearchPrefs).values({
      userId: accountId,
      baseAddressId: newAddress.id,
      radiusKm: String(validatedData.searchRadius)
    })

    // 6. Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail(email, validatedData.firstName).catch((err) => {
      console.error('Erreur envoi email de bienvenue:', err)
    })

    return {
      success: true,
      message: 'Inscription finalisée avec succès',
      user: signUpResult.user
    }
  } catch (error: any) {
    // Re-throw les erreurs HTTP déjà formatées
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur complete-registration:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la finalisation de l\'inscription'
    })
  }
})
