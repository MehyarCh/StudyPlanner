import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Clear all data
    await prisma.importantDate.deleteMany({})
    await prisma.document.deleteMany({})
    await prisma.course.deleteMany({})

    return NextResponse.json({ 
      message: 'All data cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    )
  }
} 