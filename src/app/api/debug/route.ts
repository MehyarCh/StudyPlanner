import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: "Debug route working!",
    nodeEnv: process.env.NODE_ENV,
    databaseUrlExists: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  })
} 