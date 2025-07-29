import { NextRequest, NextResponse } from 'next/server'
import { updateUser, findUserByEmail } from '@/data/userStore'

export async function PUT(req: NextRequest) {
  const { email, data } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  const user = updateUser(email, data)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
}
