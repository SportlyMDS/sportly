import { useResend } from '../utils/resend'

// En dev, utiliser l'email de test Resend. En prod, utiliser le domaine vérifié.
const FROM_EMAIL = process.env.NODE_ENV === 'production'
  ? 'Sportly <noreply@sportly.fr>'
  : 'Sportly <onboarding@resend.dev>'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const resend = useResend()

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text
  })

  if (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data?.id }
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ef781e; margin: 0;">Sportly</h1>
      </div>
      
      <h2 style="color: #1a1a1a;">Bienvenue ${firstName} ! 🎉</h2>
      
      <p>Nous sommes ravis de vous accueillir sur <strong>Sportly</strong>, votre nouvelle plateforme pour découvrir et rejoindre des activités sportives près de chez vous.</p>
      
      <p>Avec Sportly, vous pouvez :</p>
      <ul>
        <li>Découvrir des clubs et événements sportifs autour de vous</li>
        <li>Rejoindre des activités adaptées à votre niveau</li>
        <li>Rencontrer d'autres passionnés de sport</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sportly.fr" style="background-color: #ef781e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Commencer à explorer</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">À très bientôt sur Sportly !</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Cet email a été envoyé par Sportly.<br>
        Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
      </p>
    </body>
    </html>
  `

  const text = `
Bienvenue ${firstName} !

Nous sommes ravis de vous accueillir sur Sportly, votre nouvelle plateforme pour découvrir et rejoindre des activités sportives près de chez vous.

Avec Sportly, vous pouvez :
- Découvrir des clubs et événements sportifs autour de vous
- Rejoindre des activités adaptées à votre niveau
- Rencontrer d'autres passionnés de sport

À très bientôt sur Sportly !
  `.trim()

  return sendEmail({
    to,
    subject: 'Bienvenue sur Sportly ! 🎉',
    html,
    text
  })
}

export async function sendVerificationEmail(to: string, code: string, firstName?: string): Promise<EmailResult> {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ef781e; margin: 0;">Sportly</h1>
      </div>
      
      <p>${greeting}</p>
      
      <p>Voici votre code de vérification :</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="background-color: #f5f5f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; display: inline-block;">${code}</span>
      </div>
      
      <p style="color: #666; font-size: 14px;">Ce code expire dans 10 minutes.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
      </p>
    </body>
    </html>
  `

  const text = `
${greeting}

Voici votre code de vérification : ${code}

Ce code expire dans 10 minutes.

Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
  `.trim()

  return sendEmail({
    to,
    subject: 'Votre code de vérification Sportly',
    html,
    text
  })
}

export async function sendPasswordResetEmail(to: string, resetLink: string, firstName?: string): Promise<EmailResult> {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ef781e; margin: 0;">Sportly</h1>
      </div>
      
      <p>${greeting}</p>
      
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau :</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #ef781e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Réinitialiser mon mot de passe</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure.</p>
      
      <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${resetLink}" style="color: #ef781e;">${resetLink}</a></p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
      </p>
    </body>
    </html>
  `

  const text = `
${greeting}

Vous avez demandé à réinitialiser votre mot de passe.

Cliquez sur ce lien pour en créer un nouveau : ${resetLink}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
  `.trim()

  return sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe Sportly',
    html,
    text
  })
}
