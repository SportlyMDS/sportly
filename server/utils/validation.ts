import { z } from 'zod'

// Schémas de validation partagés pour l'inscription club

export const clubInfoSchema = z.object({
  sports: z.array(z.string()).min(1, 'Sélectionnez au moins un sport'),
  clubName: z.string().min(2, 'Le nom du club doit contenir au moins 2 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères')
})

export const adminInfoSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export const clubRegistrationSchema = clubInfoSchema.merge(adminInfoSchema).extend({
  verificationId: z.string().min(1, 'ID de vérification requis')
})

export const clubOfferSchema = z.object({
  clubId: z.string().min(1, 'ID du club requis'),
  offerType: z.enum(['ESSENTIEL', 'VISIBILITE'])
})

export type ClubInfo = z.infer<typeof clubInfoSchema>
export type AdminInfo = z.infer<typeof adminInfoSchema>
export type ClubRegistration = z.infer<typeof clubRegistrationSchema>
export type ClubOffer = z.infer<typeof clubOfferSchema>
