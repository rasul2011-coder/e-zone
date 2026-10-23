import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.statistics)
      .where(eq(schema.statistics.isActive, true))
      .orderBy(asc(schema.statistics.sortOrder))

    return NextResponse.json({ data: rows })
  } catch (err) {
    console.error('Error fetching statistics:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
