import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '../db/schema'
import { useDrizzle } from './drizzle'

let _auth: ReturnType<typeof betterAuth>

export function serverAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(
        useDrizzle(),
        {
          provider: 'pg',
          schema: {
            user: schema.accounts,
            session: schema.sessions,
            account: schema.oauthAccounts,
            verification: schema.verificationCodes
          }
        }
      ),
      secondaryStorage: {
        get: async (key) => {
          return await useStorage('auth').getItemRaw(`_auth:${key}`)
        },
        set: async (key, value, ttl) => {
          return await useStorage('auth').setItem(`_auth:${key}`, value, { ttl })
        },
        delete: async (key) => {
          await useStorage('auth').removeItem(`_auth:${key}`)
        }
      },
      baseURL: getBaseURL(),
      emailAndPassword: {
        enabled: true
      },
      account: {
        accountLinking: {
          enabled: true
        }
      },
      user: {
        deleteUser: {
          enabled: true
        }
      }
    })
  }
  return _auth
}

function getBaseURL() {
  let baseURL = useRuntimeConfig().public.betterAuthUrl as string
  if (!baseURL) {
    try {
      baseURL = getRequestURL(useEvent()).origin
    } catch (e) {
      console.error('Error getting base URL:', e)
    }
  }
  return baseURL
}

_auth = serverAuth()

export const auth = _auth!
