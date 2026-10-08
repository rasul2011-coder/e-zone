import { clearUserSession } from '@/lib/auth/user'
import { NextResponse } from 'next/server'

export async function POST() {
  await clearUserSession()
  return NextResponse.json({ ok: true })
}
