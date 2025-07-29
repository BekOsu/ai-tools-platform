import { NextResponse, NextRequest } from 'next/server'
import { findUserByEmail } from '@/data/userStore'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const user = findUserByEmail(email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  user.password = ''
  return NextResponse.json({ success: true })
}
