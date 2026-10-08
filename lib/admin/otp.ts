import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

// Key pattern stored in site_settings
const otpKey = (adminId: number) => `ADMIN_OTP_${adminId}`

interface OtpRecord {
  code:      string
  expiresAt: number // unix timestamp ms
}

// ─── Store OTP in site_settings ───────────────────────────────────────────────

export async function storeOtp(adminId: number, code: string): Promise<void> {
  const key = otpKey(adminId)
  const record: OtpRecord = {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  }
  const value = JSON.stringify(record)

  // Upsert
  const existing = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.key, key))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(schema.siteSettings)
      .set({ value })
      .where(eq(schema.siteSettings.key, key))
  } else {
    await db.insert(schema.siteSettings).values({
      key,
      value,
      type:        'json',
      description: 'Temporary admin OTP code (4-digit, one-time)',
    })
  }
}

// ─── Verify and consume OTP ───────────────────────────────────────────────────

export async function verifyAndConsumeOtp(
  adminId: number,
  inputCode: string,
): Promise<boolean> {
  const key = otpKey(adminId)

  const rows = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.key, key))
    .limit(1)

  if (rows.length === 0) return false

  let record: OtpRecord
  try {
    record = JSON.parse(rows[0].value) as OtpRecord
  } catch {
    return false
  }

  // Always delete — strictly one-time use
  await db
    .delete(schema.siteSettings)
    .where(eq(schema.siteSettings.key, key))

  if (Date.now() > record.expiresAt) return false
  return record.code === inputCode.trim()
}
