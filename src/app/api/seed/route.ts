import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Clear existing data first
    await prisma.importantDate.deleteMany({})
    await prisma.document.deleteMany({})
    await prisma.course.deleteMany({})

    // WS24/25 courses
    const dw1 = await prisma.course.create({
      data: {
        name: 'Design Workshop 1',
        abbreviation: 'DW1',
        credits: 6,
        semester: 'WS24/25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const hcs = await prisma.course.create({
      data: {
        name: 'Human Centered Security',
        abbreviation: 'HCS',
        credits: 6,
        semester: 'WS24/25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const mmi2 = await prisma.course.create({
      data: {
        name: 'Mensch-Maschine Interaktion',
        abbreviation: 'MMI2',
        credits: 6,
        semester: 'WS24/25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const wal = await prisma.course.create({
      data: {
        name: 'Wissenschaftliches Arbeiten',
        abbreviation: 'WAL',
        credits: 6,
        semester: 'WS24/25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const infoviz = await prisma.course.create({
      data: {
        name: 'Information Visualization',
        abbreviation: 'InfoViz',
        credits: 6,
        semester: 'WS24/25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    // SS25 courses
    const fse1 = await prisma.course.create({
      data: {
        name: 'LMU App 1',
        abbreviation: 'FSE1',
        credits: 6,
        semester: 'SS25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const vrUe = await prisma.course.create({
      data: {
        name: 'Praktikum VR',
        abbreviation: 'VR/UE',
        credits: 6,
        semester: 'SS25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const st = await prisma.course.create({
      data: {
        name: 'Software Testing',
        abbreviation: 'ST',
        credits: 6,
        semester: 'SS25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const dw2 = await prisma.course.create({
      data: {
        name: 'Design Workshop 2',
        abbreviation: 'DW2',
        credits: 6,
        semester: 'SS25',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    // WS25/26 courses
    const fse2 = await prisma.course.create({
      data: {
        name: 'LMU App 2',
        abbreviation: 'FSE2',
        credits: 6,
        semester: 'WS25/26',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const eki = await prisma.course.create({
      data: {
        name: 'Ethik der KI',
        abbreviation: 'EKI',
        credits: 6,
        semester: 'WS25/26',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const exd = await prisma.course.create({
      data: {
        name: 'Experience Design',
        abbreviation: 'EXD',
        credits: 6,
        semester: 'WS25/26',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    const omm = await prisma.course.create({
      data: {
        name: 'Online Multimedia',
        abbreviation: 'OMM',
        credits: 6,
        semester: 'WS25/26',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    // SS26 courses
    const masterThesis = await prisma.course.create({
      data: {
        name: 'Master Thesis',
        abbreviation: 'MT',
        credits: 6,
        semester: 'SS26',
        instructor: 'n.a.',
        day: 'n.a.',
        time: 'n.a.',
        room: 'n.a.',
      },
    })

    return NextResponse.json({ 
      message: 'Your courses created successfully',
      courses: 13,
      events: 0
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
} 