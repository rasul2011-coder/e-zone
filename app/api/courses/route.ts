import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.isActive, true))
      .orderBy(schema.courses.sortOrder, schema.courses.name)

    return NextResponse.json({ data: rows })
  } catch (err) {
    console.error('Error fetching courses:', err)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
