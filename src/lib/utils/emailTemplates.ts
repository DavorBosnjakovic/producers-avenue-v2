// File: emailTemplates.ts
// Path: /src/lib/utils/emailTemplates.ts
// Email templates for transactional emails

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Base email wrapper with styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Producers Avenue</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #FF6B2C;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #FF6B2C;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 14px;
    }
    .footer a {
      color: #FF6B2C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Producers Avenue</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Producers Avenue. All rights reserved.</p>
      <p>
        <a href="https://producersavenue.com/help">Help Center</a> |
        <a href="https://producersavenue.com/contact">Contact Us</a> |
        <a href="https://producersavenue.com/terms">Terms</a> |
        <a href="https://producersavenue.com/privacy">Privacy</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// Welcome Email
export const welcomeEmail = (userName: string): EmailTemplate => {
  const html = emailWrapper(`
    <h2>Welcome to Producers Avenue, ${userName}! 🎉</h2>
    <p>We're excited to have you join our community of music producers and creators.</p>
    <p>Here's what you can do on Producers Avenue:</p>
    <ul>
      <li>Buy high-quality beats, samples, and production tools</li>
      <li>Sell your own products and services</li>
      <li>Connect with other producers</li>
      <li>Grow your music production business</li>
    </ul>
    <p>Get started by exploring our marketplace:</p>
    <a href="https://producersavenue.com/marketplace/products" class="button">Browse Products</a>
    <p>If you have any questions, our support team is here to help!</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
Welcome to Producers Avenue, ${userName}!

We're excited to have you join our community of music producers and creators.

Here's what you can do on Producers Avenue:
- Buy high-quality beats, samples, and production tools
- Sell your own products and services
- Connect with other producers
- Grow your music production business

Get started by exploring our marketplace at https://producersavenue.com/marketplace/products

If you have any questions, our support team is here to help!

Best regards,
The Producers Avenue Team
  `

  return {
    subject: 'Welcome to Producers Avenue! 🎉',
    html,
    text,
  }
}

// Email Verification
export const emailVerification = (userName: string, verificationLink: string): EmailTemplate => {
  const html = emailWrapper(`
    <h2>Verify Your Email Address</h2>
    <p>Hi ${userName},</p>
    <p>Thanks for signing up! Please verify your email address to get started.</p>
    <a href="${verificationLink}" class="button">Verify Email Address</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationLink}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
Verify Your Email Address

Hi ${userName},

Thanks for signing up! Please verify your email address to get started.

Click here to verify: ${verificationLink}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Producers Avenue Team
  `

  return {
    subject: 'Verify Your Email Address',
    html,
    text,
  }
}

// Password Reset
export const passwordReset = (userName: string, resetLink: string): EmailTemplate => {
  const html = emailWrapper(`
    <h2>Reset Your Password</h2>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <a href="${resetLink}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="color: #666; font-size: 14px; word-break: break-all;">${resetLink}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
Reset Your Password

Hi ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Producers Avenue Team
  `

  return {
    subject: 'Reset Your Password',
    html,
    text,
  }
}

// Order Confirmation (Buyer)
export const orderConfirmation = (
  buyerName: string,
  orderNumber: string,
  items: Array<{ title: string; price: number }>,
  total: number
): EmailTemplate => {
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

  const html = emailWrapper(`
    <h2>Order Confirmation</h2>
    <p>Hi ${buyerName},</p>
    <p>Thank you for your purchase! Your order has been confirmed.</p>
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      ${itemsList}
      <tr>
        <td style="padding: 10px; font-weight: bold;">Total</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">$${total.toFixed(2)}</td>
      </tr>
    </table>
    
    <p>You can download your purchases from your orders page:</p>
    <a href="https://producersavenue.com/orders" class="button">View Orders</a>
    
    <p>Need help? Contact us anytime!</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const itemsText = items.map(item => `${item.title} - $${item.price.toFixed(2)}`).join('\n')

  const text = `
Order Confirmation

Hi ${buyerName},

Thank you for your purchase! Your order has been confirmed.

Order Number: ${orderNumber}

Order Details:
${itemsText}

Total: $${total.toFixed(2)}

You can download your purchases at https://producersavenue.com/orders

Need help? Contact us anytime!

Best regards,
The Producers Avenue Team
  `

  return {
    subject: `Order Confirmation - #${orderNumber}`,
    html,
    text,
  }
}

// New Sale Notification (Seller)
export const newSaleNotification = (
  sellerName: string,
  itemTitle: string,
  amount: number,
  buyerName: string
): EmailTemplate => {
  const html = emailWrapper(`
    <h2>🎉 You Made a Sale!</h2>
    <p>Hi ${sellerName},</p>
    <p>Great news! You just made a sale.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Item:</strong> ${itemTitle}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p style="margin: 5px 0;"><strong>Buyer:</strong> ${buyerName}</p>
    </div>
    
    <p>Your earnings will be available for withdrawal after 7 days.</p>
    <a href="https://producersavenue.com/orders" class="button">View Order Details</a>
    
    <p>Keep up the great work!</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
🎉 You Made a Sale!

Hi ${sellerName},

Great news! You just made a sale.

Item: ${itemTitle}
Amount: $${amount.toFixed(2)}
Buyer: ${buyerName}

Your earnings will be available for withdrawal after 7 days.

View order details at https://producersavenue.com/orders

Keep up the great work!

Best regards,
The Producers Avenue Team
  `

  return {
    subject: '🎉 You Made a Sale!',
    html,
    text,
  }
}

// New Message Notification
export const newMessageNotification = (
  recipientName: string,
  senderName: string,
  messagePreview: string
): EmailTemplate => {
  const html = emailWrapper(`
    <h2>New Message from ${senderName}</h2>
    <p>Hi ${recipientName},</p>
    <p>You have a new message from <strong>${senderName}</strong>:</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #666;">${messagePreview}</p>
    </div>
    
    <a href="https://producersavenue.com/messages" class="button">View Message</a>
    
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
New Message from ${senderName}

Hi ${recipientName},

You have a new message from ${senderName}:

"${messagePreview}"

View and reply at https://producersavenue.com/messages

Best regards,
The Producers Avenue Team
  `

  return {
    subject: `New Message from ${senderName}`,
    html,
    text,
  }
}

// Withdrawal Confirmation
export const withdrawalConfirmation = (
  userName: string,
  amount: number,
  method: string
): EmailTemplate => {
  const html = emailWrapper(`
    <h2>Withdrawal Confirmed</h2>
    <p>Hi ${userName},</p>
    <p>Your withdrawal has been processed successfully.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p style="margin: 5px 0;"><strong>Method:</strong> ${method}</p>
    </div>
    
    <p>The funds should appear in your account within 2-5 business days.</p>
    <a href="https://producersavenue.com/wallet" class="button">View Wallet</a>
    
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
Withdrawal Confirmed

Hi ${userName},

Your withdrawal has been processed successfully.

Amount: $${amount.toFixed(2)}
Method: ${method}

The funds should appear in your account within 2-5 business days.

View your wallet at https://producersavenue.com/wallet

If you have any questions, please contact our support team.

Best regards,
The Producers Avenue Team
  `

  return {
    subject: 'Withdrawal Confirmed',
    html,
    text,
  }
}

// Newsletter Welcome
export const newsletterWelcome = (email: string): EmailTemplate => {
  const html = emailWrapper(`
    <h2>Thanks for Subscribing!</h2>
    <p>You're now subscribed to the Producers Avenue newsletter.</p>
    <p>You'll receive:</p>
    <ul>
      <li>New product and service highlights</li>
      <li>Tips and tricks for music production</li>
      <li>Exclusive offers and promotions</li>
      <li>Platform updates and new features</li>
    </ul>
    <p>We'll keep it valuable and won't spam you. Promise!</p>
    <p style="font-size: 12px; color: #666; margin-top: 30px;">
      You can unsubscribe at any time by clicking <a href="https://producersavenue.com/api/newsletter?email=${email}">here</a>.
    </p>
  `)

  const text = `
Thanks for Subscribing!

You're now subscribed to the Producers Avenue newsletter.

You'll receive:
- New product and service highlights
- Tips and tricks for music production
- Exclusive offers and promotions
- Platform updates and new features

We'll keep it valuable and won't spam you. Promise!

You can unsubscribe at any time at https://producersavenue.com/api/newsletter?email=${email}
  `

  return {
    subject: 'Welcome to Producers Avenue Newsletter!',
    html,
    text,
  }
}

// Contact Form Confirmation
export const contactFormConfirmation = (userName: string): EmailTemplate => {
  const html = emailWrapper(`
    <h2>We Received Your Message</h2>
    <p>Hi ${userName},</p>
    <p>Thank you for contacting Producers Avenue. We've received your message and our support team will get back to you within 24 hours.</p>
    <p>In the meantime, you might find answers in our <a href="https://producersavenue.com/help" style="color: #FF6B2C;">Help Center</a>.</p>
    <p>Best regards,<br>The Producers Avenue Team</p>
  `)

  const text = `
We Received Your Message

Hi ${userName},

Thank you for contacting Producers Avenue. We've received your message and our support team will get back to you within 24 hours.

In the meantime, you might find answers in our Help Center at https://producersavenue.com/help

Best regards,
The Producers Avenue Team
  `

  return {
    subject: 'We Received Your Message',
    html,
    text,
  }
}