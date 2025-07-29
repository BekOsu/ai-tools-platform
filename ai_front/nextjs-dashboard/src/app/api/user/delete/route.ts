import { NextResponse, NextRequest } from 'next/server'
import { deleteUser } from '@/data/userStore'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const deleted = deleteUser(email)
  if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
