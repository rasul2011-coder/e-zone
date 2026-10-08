import nodemailer from 'nodemailer'

/**
 * Sends OTP code to admin email via Gmail SMTP.
 *
 * Requires in .env.local:
 *   GMAIL_USER=janrasula.2011@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← Google App Password (16 chars)
 *
 * How to get App Password:
 *   1. myaccount.google.com → Security → 2-Step Verification → ON
 *   2. myaccount.google.com/apppasswords
 *   3. Create → name "EnglishZone" → copy 16-char password
 */
export async function sendOtpEmail(toEmail: string, code: string): Promise<void> {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  // Verify connection before sending
  await transporter.verify()

  await transporter.sendMail({
    from:    `"English Zone Admin" <${user}>`,
    to:      toEmail,
    subject: `Ваш код подтверждения: ${code}`,
    text:    `Код входа в Admin Panel: ${code}\n\nДействителен 10 минут.\nНикому не сообщайте этот код.`,
    html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a2a4a 0%,#1e3460 100%);padding:32px;">
            <p style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              English<span style="color:#f97316;">Zone</span>
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:3px;">
              Admin Panel · 2FA
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 32px 32px;">
            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827;">
              Код подтверждения
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.7;">
              Для входа в Admin Panel введите этот код.<br/>
              Он действителен <strong style="color:#111827;">10 минут</strong> и используется только один раз.
            </p>

            <!-- OTP Box -->
            <div style="text-align:center;margin:0 0 32px;">
              <div style="display:inline-block;background:#f8fafc;border:2px solid #e2e8f0;border-radius:16px;padding:24px 48px;">
                <span style="font-size:52px;font-weight:900;letter-spacing:20px;color:#1a2a4a;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
                ⏱ Действителен 10 минут
              </p>
            </div>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 16px;">
              <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                ⚠️ Никому не сообщайте этот код. Если вы не пытались войти — проигнорируйте письмо.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              © ${new Date().getFullYear()} English Zone · Языковой центр · Бишкек, Кыргызстан
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
