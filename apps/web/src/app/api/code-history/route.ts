import { NextRequest, NextResponse } from 'next/server'

interface Entry {
  id: string
  code: string
  language: string
  timestamp: number
}

const history: Entry[] = []

export async function POST(req: NextRequest) {
  const { code, language } = await req.json()
  if (!code || !language) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }
  const entry: Entry = { id: Date.now().toString(), code, language, timestamp: Date.now() }
  history.push(entry)
  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ history })
}
