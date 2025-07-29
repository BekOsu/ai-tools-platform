import { NextResponse } from 'next/server'
import { usageData } from '@/data/metricsStore'

export async function GET() {
  return NextResponse.json({ usage: usageData })
}
