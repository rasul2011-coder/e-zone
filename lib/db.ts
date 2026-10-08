import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local')
}

// Low-level tagged-template client (safe parameterised queries)
// Example: const rows = await sql`SELECT * FROM users WHERE id = ${id}`
export const sql = neon(process.env.DATABASE_URL)

// Drizzle ORM client — use this for type-safe queries
// Example: const courses = await db.select().from(schema.courses)
export const db = drizzle(sql, { schema })

export { schema }
