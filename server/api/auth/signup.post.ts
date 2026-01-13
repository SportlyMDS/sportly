import { z } from 'zod'
import { useDrizzle } from '../../utils/drizzle'
import { users } from '../../db/schema'
import { auth } from '../../utils/auth'
import { sendWelcomeEmail } from '../../services/email'

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Valider les données
  const validatedData = signUpSchema.parse(body)

  // Extraire firstName et lastName du name si non fournis
  let firstName = validatedData.firstName
  let lastName = validatedData.lastName

  if (!firstName || !lastName) {
    const nameParts = validatedData.name.split(' ')
    firstName = firstName || nameParts[0] || validatedData.name
    lastName = lastName || nameParts.slice(1).join(' ') || validatedData.name
  }

  try {
    // Créer le compte avec Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name
      }
    })

    if (!signUpResult || !signUpResult.user) {
      throw createError({
        statusCode: 400,
        message: 'Échec de la création du compte'
      })
    }

    const accountId = signUpResult.user.id

    // Créer l'entrée dans la table users
    const db = useDrizzle()
    await db.insert(users).values({
      accountId,
      firstName,
      lastName
    })

    // Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail(validatedData.email, firstName).catch((err) => {
      console.error('Erreur envoi email de bienvenue:', err)
    })

    return {
      success: true,
      user: signUpResult.user
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de l\'inscription'
    })
  }
})
