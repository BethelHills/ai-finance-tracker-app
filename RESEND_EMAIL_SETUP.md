# Email Service Setup Guide for AI Finance Tracker

This guide will help you set up email services for sending OTP verification codes. The application supports multiple email services with automatic fallback for maximum reliability.

## 🚀 Quick Setup (Recommended: Resend)

### Option 1: Resend (Fastest & Most Reliable)

**Resend** is a modern email API service that's perfect for transactional emails like OTP codes.

#### Steps:

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create a free account (100 emails/day free tier)

2. **Get your API Key**:
   - In your Resend dashboard, go to "API Keys"
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Configure Environment Variables**:
   ```bash
   # Add to your .env.local file
   RESEND_API_KEY=re_your_actual_api_key_here
   EMAIL_FROM="AI Finance Tracker <noreply@aifinancetracker.com>"
   ```

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

#### Benefits of Resend:
- ⚡ **Ultra-fast delivery** (usually under 1 second)
- 📈 **High deliverability** (emails reach inbox, not spam)
- 🛡️ **Built-in security** (no need to manage SMTP credentials)
- 📊 **Analytics** (track email delivery and opens)
- 💰 **Free tier** (100 emails/day)

---

## 🔧 Alternative Setup Options

### Option 2: Gmail SMTP (Traditional)

If you prefer to use Gmail SMTP:

#### Steps:

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Configure Environment Variables**:
   ```bash
   # Add to your .env.local file
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM="AI Finance Tracker <noreply@aifinancetracker.com>"
   ```

### Option 3: Development Mode (No Setup Required)

If you don't want to configure email services right now, the application will automatically use a development email service that logs OTP codes to the console. This is perfect for testing.

---

## 📧 Email Service Priority

The application automatically chooses the best available email service:

1. **Resend** (if `RESEND_API_KEY` is configured)
2. **SMTP** (if `EMAIL_USER` and `EMAIL_PASSWORD` are configured)
3. **Development Service** (if no credentials are configured)

## 🧪 Testing Your Setup

### Check Email Configuration:
```bash
curl http://localhost:3000/api/check-email-config
```

### Test OTP Sending:
1. Go to your login/signup page
2. Enter an email address
3. Check the console logs for email service status
4. If using dev mode, OTP will be logged to console
5. If using Resend/SMTP, check your email inbox

## 🔍 Troubleshooting

### Resend Issues:
- **"Invalid API key"**: Make sure your API key starts with `re_`
- **"Domain not verified"**: For production, verify your sending domain in Resend dashboard
- **Rate limits**: Free tier allows 100 emails/day

### SMTP Issues:
- **"Authentication failed"**: Use App Password, not your regular Gmail password
- **"Connection timeout"**: Check your internet connection and firewall settings
- **"Rate limits"**: Gmail has sending limits (500 emails/day for free accounts)

### Development Mode:
- OTP codes are logged to the server console
- Check your terminal where `npm run dev` is running
- Look for messages like `📧 [DEV MODE] OTP Code: 123456`

## 🚀 Production Recommendations

For production deployment:

1. **Use Resend** for the best performance and deliverability
2. **Verify your domain** in Resend dashboard
3. **Set up proper environment variables** in your hosting platform
4. **Monitor email delivery** through Resend analytics
5. **Consider upgrading** to a paid plan for higher limits

## 📝 Environment Variables Summary

```bash
# Resend (Recommended)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="AI Finance Tracker <noreply@aifinancetracker.com>"

# OR Gmail SMTP (Alternative)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="AI Finance Tracker <noreply@aifinancetracker.com>"

# Optional: Custom SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

**Need help?** Check the console logs when sending emails - they will show which service is being used and any error messages.
