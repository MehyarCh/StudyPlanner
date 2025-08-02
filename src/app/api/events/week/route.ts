import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7) // End of week (next Sunday)
    endOfWeek.setHours(23, 59, 59, 999)

    const weeklyDeadlines = await prisma.importantDate.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
        type: {
          in: ['ASSIGNMENT_DUE', 'PROJECT_DUE', 'EXAM_DATE'],
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(weeklyDeadlines)
  } catch (error) {
    console.error('Error fetching weekly deadlines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly deadlines' },
      { status: 500 }
    )
  }
} 