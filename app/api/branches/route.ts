import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.branches)
      .where(eq(schema.branches.isActive, true))
      .orderBy(schema.branches.sortOrder, schema.branches.name)

    return NextResponse.json({ data: rows })
  } catch (err) {
    console.error('Error fetching branches:', err)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}
