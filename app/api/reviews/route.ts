import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select({
        id:       schema.reviews.id,
        name:     schema.reviews.name,
        photo:    schema.reviews.photo,
        text:     schema.reviews.text,
        rating:   schema.reviews.rating,
        sortOrder: schema.reviews.sortOrder,
      })
      .from(schema.reviews)
      .where(eq(schema.reviews.isPublished, true))
      .orderBy(asc(schema.reviews.sortOrder))

    return NextResponse.json({ data: rows })
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
