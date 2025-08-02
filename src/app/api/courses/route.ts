import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, abbreviation, credits, semester, instructor, day, time, room } = body

    // Validate required fields
    if (!name || !credits || !semester || !instructor || !day || !time || !room) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate credits is a positive number
    const creditsNum = parseInt(credits)
    if (isNaN(creditsNum) || creditsNum <= 0) {
      return NextResponse.json(
        { error: 'Credits must be a positive number' },
        { status: 400 }
      )
    }

    // Create course in database
    const course = await prisma.course.create({
      data: {
        name,
        abbreviation: abbreviation || null,
        credits: creditsNum,
        semester,
        instructor,
        day,
        time,
        room,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔍 Starting GET /api/courses')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set')
      return NextResponse.json(
        { error: 'Database URL not configured' },
        { status: 500 }
      )
    }

    console.log('✅ DATABASE_URL is set, attempting database connection...')
    
    const courses = await prisma.course.findMany({
      include: {
        documents: true,
        importantDates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('✅ Successfully fetched courses:', courses.length)
    return NextResponse.json(courses)
  } catch (error) {
    console.error('❌ Error fetching courses:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    )
  }
} 