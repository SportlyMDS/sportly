import { z } from 'zod'
import { createHash } from 'node:crypto'
import { eq, and, gt, isNull } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { emailVerifications } from '../../db/schema'

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres')
})

// Hash le code OTP avec SHA-256
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

const MAX_ATTEMPTS = 5

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code } = verifyOtpSchema.parse(body)

  const db = useDrizzle()

  try {
    // Récupérer la vérification la plus récente non expirée et non consommée
    const now = new Date()
    const verifications = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, email),
          gt(emailVerifications.expiresAt, now),
          isNull(emailVerifications.verifiedAt)
        )
      )
      .orderBy(emailVerifications.createdAt)
      .limit(1)

    if (verifications.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Aucun code de vérification valide trouvé. Veuillez en demander un nouveau.'
      })
    }

    const verification = verifications[0]

    // Vérifier le nombre de tentatives
    if (verification.attempts >= MAX_ATTEMPTS) {
      throw createError({
        statusCode: 429,
        message: 'Trop de tentatives. Veuillez demander un nouveau code.'
      })
    }

    // Incrémenter le compteur de tentatives
    await db
      .update(emailVerifications)
      .set({ attempts: verification.attempts + 1 })
      .where(eq(emailVerifications.id, verification.id))

    // Vérifier le code
    const codeHash = hashCode(code)

    if (codeHash !== verification.codeHash) {
      const remainingAttempts = MAX_ATTEMPTS - verification.attempts - 1

      throw createError({
        statusCode: 400,
        message: remainingAttempts > 0
          ? `Code incorrect. ${remainingAttempts} tentative(s) restante(s).`
          : 'Code incorrect. Veuillez demander un nouveau code.'
      })
    }

    // Code valide : marquer comme vérifié
    await db
      .update(emailVerifications)
      .set({ verifiedAt: now })
      .where(eq(emailVerifications.id, verification.id))

    return {
      success: true,
      message: 'Email vérifié avec succès',
      verificationId: verification.id
    }
  } catch (error: any) {
    // Re-throw les erreurs HTTP déjà formatées
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur verify-otp:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la vérification du code'
    })
  }
})
