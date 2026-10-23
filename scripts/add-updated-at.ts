import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    // Add updated_at column if not exists
    await db.execute(sql`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    `)
    console.log('✅ updated_at column added (or already exists)')
    process.exit(0)
  } catch (e) {
    console.error('❌ Error:', e)
    process.exit(1)
  }
}

main()
