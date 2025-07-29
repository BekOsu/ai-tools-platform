import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/data/userStore'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  try {
    const user = createUser(name, email, password)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
