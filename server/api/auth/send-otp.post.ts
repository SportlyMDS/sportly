import { z } from 'zod'
import { createHash, randomInt } from 'node:crypto'
import { eq, and, gt } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { emailVerifications, accounts } from '../../db/schema'
import { sendVerificationEmail } from '../../services/email'

const sendOtpSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional()
})

// Génère un code OTP à 6 chiffres
function generateOtpCode(): string {
  return randomInt(100000, 999999).toString()
}

// Hash le code OTP avec SHA-256
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

// Génère un ID unique
function generateId(): string {
  return crypto.randomUUID()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, firstName } = sendOtpSchema.parse(body)

  const db = useDrizzle()

  try {
    // Vérifier si l'email est déjà utilisé par un compte existant
    const existingAccount = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1)

    if (existingAccount.length > 0) {
      throw createError({
        statusCode: 409,
        message: 'Un compte existe déjà avec cette adresse email'
      })
    }

    // Rate limiting: Vérifier le nombre de demandes récentes (max 3 par heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentRequests = await db
      .select({ id: emailVerifications.id })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          gt(emailVerifications.createdAt, oneHourAgo)
        )
      )

    if (recentRequests.length >= 3) {
      throw createError({
        statusCode: 429,
        message: 'Trop de demandes. Veuillez réessayer dans une heure.'
      })
    }

    // Générer le code OTP
    const otpCode = generateOtpCode()
    const codeHash = hashCode(otpCode)

    // Stocker le code hashé en base (expire dans 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.insert(emailVerifications).values({
      id: generateId(),
      email,
      codeHash,
      attempts: 0,
      expiresAt
    })

    // Envoyer l'email avec le code
    const emailResult = await sendVerificationEmail(email, otpCode, firstName)

    if (!emailResult.success) {
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de l\'envoi de l\'email'
      })
    }

    return {
      success: true,
      message: 'Code de vérification envoyé',
      expiresIn: 600 // 10 minutes en secondes
    }
  } catch (error: any) {
    // Re-throw les erreurs HTTP déjà formatées
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de l\'envoi du code de vérification'
    })
  }
})
