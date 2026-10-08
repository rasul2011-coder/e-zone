/**
 * One-time script: creates the admin role + admin user in the DB.
 * Run with: npx tsx --env-file=.env.local scripts/seed-admin.ts
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db  = drizzle(sql, { schema })

const ADMIN_EMAIL    = 'janrasula.2011@gmail.com'
const ADMIN_NAME     = 'Rasul'
// bcrypt hash of "admin123" (rounds=12)
const PASSWORD_HASH  = '$2b$12$B.IFETzuUZLgdAgnUTIexu1bp.bHt3xCXDNksBxkFpFlbRgaOYVYW'

async function main() {
  console.log('🔧 Seeding admin...')

  // 1. Upsert role "admin"
  const existingRole = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.name, 'admin'))
    .limit(1)

  let roleId: number

  if (existingRole.length > 0) {
    roleId = existingRole[0].id
    console.log(`✅ Role "admin" already exists (id=${roleId})`)
  } else {
    const inserted = await db
      .insert(schema.roles)
      .values({ name: 'admin', description: 'Full admin access' })
      .returning({ id: schema.roles.id })
    roleId = inserted[0].id
    console.log(`✅ Created role "admin" (id=${roleId})`)
  }

  // 2. Upsert admin user
  const existingAdmin = await db
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.email, ADMIN_EMAIL))
    .limit(1)

  if (existingAdmin.length > 0) {
    // Update password hash and make sure active
    await db
      .update(schema.admins)
      .set({ passwordHash: PASSWORD_HASH, isActive: true, roleId })
      .where(eq(schema.admins.email, ADMIN_EMAIL))
    console.log(`✅ Updated admin "${ADMIN_EMAIL}" with new password hash`)
  } else {
    await db.insert(schema.admins).values({
      name:         ADMIN_NAME,
      email:        ADMIN_EMAIL,
      passwordHash: PASSWORD_HASH,
      roleId,
      isActive:     true,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    })
    console.log(`✅ Created admin "${ADMIN_EMAIL}"`)
  }

  console.log('')
  console.log('🎉 Done! You can now log in at /admin/login')
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Password: admin123`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
