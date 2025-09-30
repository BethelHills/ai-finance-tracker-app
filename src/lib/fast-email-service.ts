import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    throw new Error('Resend API key not configured');
  }

  try {
    const start = Date.now();
    const result = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        'AI Finance Tracker <noreply@aifinancetracker.com>',
      to,
      subject,
      html,
    });

    const duration = Date.now() - start;
    console.log(
      `📧 Email sent successfully in ${duration}ms:`,
      result.data?.id
    );
    return result;
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw err;
  }
}
