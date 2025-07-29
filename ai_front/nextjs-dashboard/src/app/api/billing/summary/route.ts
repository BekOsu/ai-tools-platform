import { NextResponse } from 'next/server'
import { billing } from '@/data/metricsStore'

export async function GET() {
  return NextResponse.json({ billing })
}
