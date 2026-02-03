import { Resend } from 'resend'

let _resend: Resend | null = null

export function useResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY || useRuntimeConfig().resendApiKey

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables')
    }

    _resend = new Resend(apiKey)
  }

  return _resend
}
