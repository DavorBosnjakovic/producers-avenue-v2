// File: emailService.ts
// Path: /src/lib/utils/emailService.ts
// Email service utility for sending emails

// This is a wrapper for your email service provider (Resend, SendGrid, etc.)
// Configure your preferred email service below

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text: string
  from?: string
}

// Default sender email
const DEFAULT_FROM = 'Producers Avenue <noreply@producersavenue.com>'

/**
 * Send email using Resend (recommended for Next.js)
 * Install: npm install resend
 * Docs: https://resend.com/docs
 */
export async function sendEmailWithResend(params: SendEmailParams): Promise<boolean> {
  try {
    // Uncomment when ready to use Resend
    /*
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: params.from || DEFAULT_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    console.log('Email sent successfully:', data)
    return true
    */

    // Mock implementation for development
    console.log('📧 Email would be sent (Resend):')
    console.log('To:', params.to)
    console.log('Subject:', params.subject)
    console.log('---')
    return true
  } catch (error) {
    console.error('Error sending email with Resend:', error)
    return false
  }
}

/**
 * Send email using SendGrid
 * Install: npm install @sendgrid/mail
 * Docs: https://docs.sendgrid.com/for-developers/sending-email/nodejs
 */
export async function sendEmailWithSendGrid(params: SendEmailParams): Promise<boolean> {
  try {
    // Uncomment when ready to use SendGrid
    /*
    const sgMail = await import('@sendgrid/mail')
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!)

    const msg = {
      to: params.to,
      from: params.from || DEFAULT_FROM,
      subject: params.subject,
      text: params.text,
      html: params.html,
    }

    await sgMail.default.send(msg)
    console.log('Email sent successfully via SendGrid')
    return true
    */

    // Mock implementation for development
    console.log('📧 Email would be sent (SendGrid):')
    console.log('To:', params.to)
    console.log('Subject:', params.subject)
    console.log('---')
    return true
  } catch (error) {
    console.error('Error sending email with SendGrid:', error)
    return false
  }
}

/**
 * Send email using Nodemailer (for custom SMTP)
 * Install: npm install nodemailer
 * Docs: https://nodemailer.com/
 */
export async function sendEmailWithNodemailer(params: SendEmailParams): Promise<boolean> {
  try {
    // Uncomment when ready to use Nodemailer
    /*
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const info = await transporter.sendMail({
      from: params.from || DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    })

    console.log('Email sent successfully via Nodemailer:', info.messageId)
    return true
    */

    // Mock implementation for development
    console.log('📧 Email would be sent (Nodemailer):')
    console.log('To:', params.to)
    console.log('Subject:', params.subject)
    console.log('---')
    return true
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error)
    return false
  }
}

/**
 * Main email sending function
 * Choose your preferred email service by setting EMAIL_PROVIDER env variable
 * Options: 'resend', 'sendgrid', 'nodemailer'
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'resend'

  switch (provider) {
    case 'resend':
      return sendEmailWithResend(params)
    case 'sendgrid':
      return sendEmailWithSendGrid(params)
    case 'nodemailer':
      return sendEmailWithNodemailer(params)
    default:
      console.error(`Unknown email provider: ${provider}`)
      return false
  }
}

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string,
  text: string
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
    })

    if (result) {
      success++
    } else {
      failed++
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return { success, failed }
}

/**
 * Example usage with email templates
 */
/*
import { welcomeEmail } from './emailTemplates'

const template = welcomeEmail('John Doe')
await sendEmail({
  to: 'user@example.com',
  subject: template.subject,
  html: template.html,
  text: template.text,
})
*/