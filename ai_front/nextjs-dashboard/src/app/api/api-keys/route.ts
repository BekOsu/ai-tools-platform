import { NextRequest, NextResponse } from 'next/server'
import { createApiKey, deleteApiKey, listApiKeys } from '@/data/apiKeysStore'

export async function GET() {
  return NextResponse.json({ keys: listApiKeys() })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const key = createApiKey(name)
  return NextResponse.json({ key })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  deleteApiKey(id)
  return NextResponse.json({ success: true })
}
