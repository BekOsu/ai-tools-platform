import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/data/userStore'
import crypto from 'crypto'

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex')
  return { salt: s, hash }
}

export async function PUT(req: NextRequest) {
  const { email, data } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  let updateData = { ...data }
  if (data?.password) {
    const { salt, hash } = hashPassword(data.password)
    updateData = { ...data, passwordHash: hash, salt }
    delete (updateData as any).password
  }
  const user = updateUser(email, updateData)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
}
