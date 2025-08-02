const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.importantDate.deleteMany();
    await prisma.document.deleteMany();
    await prisma.course.deleteMany();

    console.log('✅ Cleared existing data');

    // Create courses
    const courses = [
      {
        name: "Datenbanken und Webtechnologien 1",
        abbreviation: "DW1",
        credits: 6,
        semester: "WS24/25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Human-Computer Systems",
        abbreviation: "HCS",
        credits: 6,
        semester: "WS24/25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Multimedia und Mensch-Maschine-Interaktion 2",
        abbreviation: "MMI2",
        credits: 6,
        semester: "WS24/25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Webanwendungen und -architekturen",
        abbreviation: "WAL",
        credits: 6,
        semester: "WS24/25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Informationsvisualisierung",
        abbreviation: "InfoViz",
        credits: 6,
        semester: "WS24/25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Formale Spezifikation und Entwurf 1",
        abbreviation: "FSE1",
        credits: 6,
        semester: "SS25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Virtuelle Realität und User Experience",
        abbreviation: "VR/UE",
        credits: 6,
        semester: "SS25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Softwaretechnik",
        abbreviation: "ST",
        credits: 6,
        semester: "SS25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Datenbanken und Webtechnologien 2",
        abbreviation: "DW2",
        credits: 6,
        semester: "SS25",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Formale Spezifikation und Entwurf 2",
        abbreviation: "FSE2",
        credits: 6,
        semester: "WS25/26",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Eingebettete KI-Systeme",
        abbreviation: "EKI",
        credits: 6,
        semester: "WS25/26",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Experience Design",
        abbreviation: "EXD",
        credits: 6,
        semester: "WS25/26",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Objektorientierte Modellierung und Methoden",
        abbreviation: "OMM",
        credits: 6,
        semester: "WS25/26",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      },
      {
        name: "Master Thesis",
        abbreviation: "MT",
        credits: 30,
        semester: "SS26",
        instructor: "n.a.",
        day: "n.a.",
        time: "n.a.",
        room: "n.a.",
        status: "ENROLLED"
      }
    ];

    const createdCourses = await prisma.course.createMany({
      data: courses
    });

    console.log(`✅ Created ${createdCourses.count} courses`);

    // Get course IDs for creating related data
    const allCourses = await prisma.course.findMany();
    
    // Create some sample documents and events
    const documents = [];
    const events = [];

    allCourses.forEach(course => {
      // Add a sample document for each course
      documents.push({
        name: `${course.abbreviation} - Lecture Notes`,
        type: "LECTURE",
        fileUrl: "#",
        courseId: course.id
      });

      // Add a sample event for each course
      events.push({
        title: `${course.abbreviation} - Assignment Due`,
        date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
        type: "ASSIGNMENT_DUE",
        description: "Sample assignment deadline",
        courseId: course.id
      });
    });

    await prisma.document.createMany({
      data: documents
    });

    await prisma.importantDate.createMany({
      data: events
    });

    console.log(`✅ Created ${documents.length} documents and ${events.length} events`);
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 