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
    const courses = await prisma.course.findMany({
      include: {
        documents: true,
        importantDates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
} 