import { NextRequest, NextResponse } from 'next/server'
import { verifyUser } from '@/data/userStore'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }
  const user = await verifyUser(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
}
