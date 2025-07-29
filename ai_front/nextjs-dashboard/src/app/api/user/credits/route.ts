import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/data/userStore'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  const user = findUserByEmail(email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ credits: user.credits })
}

