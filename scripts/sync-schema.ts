import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  const queries = [
    // applications table
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS course_name VARCHAR(150)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_amount INTEGER`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_receipt VARCHAR(1000)`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS age INTEGER`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS role VARCHAR(50)`,
    // application_statuses description column
    `ALTER TABLE application_statuses ADD COLUMN IF NOT EXISTS description VARCHAR(255)`,
  ]

  for (const q of queries) {
    try {
      await db.execute(sql.raw(q))
      console.log(`✅ ${q.substring(0, 60)}...`)
    } catch (e: any) {
      console.error(`❌ ${q.substring(0, 60)}: ${e.message}`)
    }
  }
  process.exit(0)
}

main()
