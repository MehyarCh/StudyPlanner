import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
      include: { documents: true, importantDates: true },
    })
    if (!course) { return NextResponse.json({ error: 'Course not found' }, { status: 404 }) }
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, abbreviation, credits, semester, instructor, day, time, room } = body

    if (!name || !credits || !semester || !instructor || !day || !time || !room) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    const creditsNum = parseInt(credits)
    if (isNaN(creditsNum) || creditsNum <= 0) {
      return NextResponse.json({ error: 'Credits must be a positive number' }, { status: 400 })
    }

    const existingCourse = await prisma.course.findUnique({ where: { id } })
    if (!existingCourse) { return NextResponse.json({ error: 'Course not found' }, { status: 404 }) }

    const course = await prisma.course.update({
      where: { id },
      data: { name, abbreviation: abbreviation || null, credits: creditsNum, semester, instructor, day, time, room },
    })
    return NextResponse.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existingCourse = await prisma.course.findUnique({ where: { id } })
    if (!existingCourse) { return NextResponse.json({ error: 'Course not found' }, { status: 404 }) }

    await prisma.course.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
} 