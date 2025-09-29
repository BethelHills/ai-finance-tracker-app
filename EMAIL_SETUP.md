# Email Configuration Setup

## Current Issue

The OTP system is not sending real emails because email credentials are not configured. Here's how to fix it:

## Quick Setup (Gmail)

### 1. Enable 2-Factor Authentication on Gmail

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification

### 2. Generate App Password

1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character password

### 3. Set Environment Variables

Create or update your `.env.local` file:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=AI Finance Tracker <noreply@aifinancetracker.com>
```

### 4. Alternative Email Services

#### Using SendGrid (Recommended for Production)

```bash
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

#### Using Mailgun

```bash
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASSWORD=your-mailgun-smtp-password
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
```

#### Using AWS SES

```bash
EMAIL_USER=your-aws-ses-smtp-username
EMAIL_PASSWORD=your-aws-ses-smtp-password
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
```

## Testing Email Configuration

### 1. Restart Development Server

```bash
npm run dev
```

### 2. Test Signup Flow

1. Go to `/auth/signup`
2. Fill out the form
3. Check your email for the OTP code
4. Enter the code to complete signup

### 3. Check Console Logs

The server will log email sending status:

- ✅ `📧 Email sent successfully: [message-id]`
- ❌ `❌ Email sending failed: [error]`

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check your email credentials
   - Ensure 2FA is enabled and app password is correct

2. **"Connection timeout"**
   - Check your internet connection
   - Verify SMTP host and port settings

3. **"Email not received"**
   - Check spam/junk folder
   - Verify email address is correct
   - Check email service provider limits

### Development Mode

In development, OTP codes are also logged to the console for testing purposes.

## Production Deployment

For production, use a dedicated email service:

1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - Easy setup and reliable delivery

2. **Mailgun**
   - Free tier: 5,000 emails/month
   - Good for high volume

3. **AWS SES**
   - Very cost-effective
   - Requires AWS account setup

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service for production
- Monitor email sending limits and costs
