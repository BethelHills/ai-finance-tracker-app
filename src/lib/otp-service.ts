import { sendEmail } from './fast-email-service';

export async function sendOTP(to: string, otp: string) {
  const subject = 'Your AI Finance Tracker OTP Code';
  const html = `<p>Your OTP code is <b>${otp}</b></p>`;

  try {
    await sendEmail(to, subject, html);
  } catch (err) {
    console.error('❌ Failed to send OTP:', err);
    throw err;
  }
}
