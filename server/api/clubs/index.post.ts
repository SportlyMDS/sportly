import { z } from 'zod'
import { eq, and, isNotNull } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { emailVerifications, accounts, clubs, addresses } from '../../db/schema'
import { auth } from '../../utils/auth'
import { sendWelcomeEmail } from '../../services/email'

const clubRegistrationSchema = z.object({
  verificationId: z.string().min(1, 'ID de vérification requis'),
  sports: z.array(z.string()).min(1, 'Sélectionnez au moins un sport'),
  clubName: z.string().min(2, 'Le nom du club doit contenir au moins 2 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation avec Zod
  const parseResult = clubRegistrationSchema.safeParse(body)
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
    // 1. Vérifier que l'email a bien été vérifié
    const verifications = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.id, data.verificationId),
          isNotNull(emailVerifications.verifiedAt)
        )
      )
      .limit(1)

    const verification = verifications[0]
    if (!verification) {
      throw createError({
        statusCode: 400,
        message: 'Vérification d\'email invalide ou expirée. Veuillez recommencer l\'inscription.'
      })
    }

    const email = verification.email

    // 2. Créer le compte avec Better Auth (type CLUB)
    const name = `${data.firstName} ${data.lastName}`
    const signUpResult = await auth().api.signUpEmail({
      body: {
        email,
        password: data.password,
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

    // 3. Mettre à jour le type de compte en CLUB + marquer email vérifié (OTP validé à l'étape 1)
    await db
      .update(accounts)
      .set({
        accountType: 'CLUB',
        phone: data.phone,
        emailVerified: true
      })
      .where(eq(accounts.id, accountId))

    // 4. Créer l'entrée dans la table clubs
    await db.insert(clubs).values({
      accountId,
      clubName: data.clubName,
      description: data.description,
      websiteUrl: data.website || null,
      phone: data.phone,
      email,
      sports: data.sports,
      adminFirstName: data.firstName,
      adminLastName: data.lastName,
      verificationId: data.verificationId,
      registrationStatus: 'PENDING'
    })

    // 5. Créer l'adresse du club
    await db.insert(addresses).values({
      accountId,
      line1: data.address,
      postalCode: data.postalCode,
      city: data.city,
      isPrimary: true
    })

    // 6. Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail(email, data.firstName).catch((err) => {
      console.error('Erreur envoi email de bienvenue:', err)
    })

    return {
      success: true,
      message: 'Club créé avec succès',
      clubId: accountId,
      user: signUpResult.user
    }
  } catch (error: unknown) {
    // Re-throw les erreurs HTTP déjà formatées
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur création club:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du club'
    })
  }
})
