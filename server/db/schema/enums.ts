import { pgEnum } from 'drizzle-orm/pg-core'

// Enums basés sur le MCD Sportly
export const accountTypeEnum = pgEnum('account_type', ['USER', 'CLUB'])
export const otpChannelEnum = pgEnum('otp_channel', ['EMAIL', 'SMS'])
export const eventTypeEnum = pgEnum('event_type', ['STAGE', 'TOURNOI', 'ENTRAINEMENT', 'DECOUVERTE'])
export const sportLevelEnum = pgEnum('sport_level', ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'PRO'])
export const targetAudienceEnum = pgEnum('target_audience', ['ENFANTS', 'ADOS', 'ADULTES', 'SENIORS', 'TOUS'])
export const facilityTypeEnum = pgEnum('facility_type', ['HANDICAP_FRIENDLY', 'VESTIAIRES', 'TOILETTES'])
export const weekdayEnum = pgEnum('weekday', ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'])

// Enums pour l'inscription club
export const clubRegistrationStatusEnum = pgEnum('club_registration_status', ['DRAFT', 'PENDING', 'VERIFIED', 'COMPLETED'])
export const clubOfferTypeEnum = pgEnum('club_offer_type', ['ESSENTIEL', 'VISIBILITE'])
