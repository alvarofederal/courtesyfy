// src/lib/email.ts
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { VerificationEmailTemplate } from '@/components/emails/verification-email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string, 
  code: string,
  expiresInMinutes: number = 0.75
) {
  console.log('🔍 [DEBUG] Iniciando sendVerificationEmail')
  console.log('🔍 [DEBUG] Email:', email)
  console.log('🔍 [DEBUG] Código:', code)
  console.log('🔍 [DEBUG] NODE_ENV:', process.env.NODE_ENV)
  console.log('🔍 [DEBUG] RESEND_API_KEY existe?', !!process.env.RESEND_API_KEY)

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [DEBUG] RESEND_API_KEY não está definida!')
      throw new Error('RESEND_API_KEY não configurada')
    }

    console.log('📧 [DEBUG] Renderizando template...')
    const emailHtml = await render(
      VerificationEmailTemplate({
        code,
        expiresInMinutes,
      })
    )

    console.log('📨 [DEBUG] Chamando resend.emails.send...')
    const { data, error } = await resend.emails.send({
      from: 'BaseMedical <basemedical@karollynemorais.com.br>',
      to: email,
      subject: '🔐 Código de Verificação - BaseMedical',
      html: emailHtml,
    })

    if (error) {
      console.error('❌ [DEBUG] Erro do Resend:', JSON.stringify(error, null, 2))
      throw new Error(`Erro ao enviar email: ${error.message}`)
    }

    console.log('✅ [DEBUG] Email enviado! ID:', data?.id)
    return data
  } catch (error) {
    console.error('❌ [DEBUG] Exceção capturada:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  // ✅ Modo DEV
  if (process.env.NODE_ENV === "development") {
    console.log("\n🔑 ========================================")
    console.log("🔑 [DEV] Email de Recuperação de Senha")
    console.log("🔑 ========================================")
    console.log(`🔑 Para: ${email}`)
    console.log(`🔑 Link: ${resetUrl}`)
    console.log("🔑 ========================================\n")
    return
  }

  // ✅ Produção - enviar com Resend
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY não configurada. Email não será enviado.')
      return
    }

    console.log('📧 Preparando envio de email de recuperação para:', email)

    // Aqui você pode criar outro template React Email ou usar HTML direto
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Recuperação de Senha</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Redefinir sua senha</h2>
              <p style="color: #4b5563; font-size: 16px;">
                Recebemos uma solicitação para redefinir a senha da sua conta.
              </p>
              <p style="color: #4b5563; font-size: 16px;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Redefinir Senha</a>
              </div>
              <p style="color: #d97706; font-size: 14px; background: #fef3c7; padding: 12px; border-radius: 6px;">
                <strong>⚠️ Este link expira em 1 hora.</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Se você não solicitou a recuperação de senha, ignore este email. Sua senha permanecerá inalterada.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} BaseMedical. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'BaseMedical <basemedical@karollynemorais.com.br>',
      to: email,
      subject: '🔑 Recuperação de Senha - BaseMedical',
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      throw new Error(`Erro ao enviar email: ${error.message}`)
    }

    console.log('✅ Email de recuperação enviado com sucesso:', data?.id)
  } catch (error) {
    console.error('❌ Erro ao enviar email de recuperação:', error)
    throw error
  }
}