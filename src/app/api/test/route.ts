import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug Environment Variables in Production:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    
    if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 30));
      console.log('DATABASE_URL ends with:', process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 20));
    }
    
    return NextResponse.json({
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) || 'N/A',
      databaseUrlEnd: process.env.DATABASE_URL?.substring(process.env.DATABASE_URL.length - 20) || 'N/A'
    })
  } catch (error) {
    console.error('Error in test route:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
} 