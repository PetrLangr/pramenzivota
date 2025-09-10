import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/events - Získání všech událostí
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        date: {
          gte: new Date() // Pouze nadcházející události
        }
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })

    // Transformuj data pro frontend
    const transformedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.startTime,
      duration: event.durationMinutes,
      price: event.price,
      maxParticipants: event.maxParticipants,
      currentParticipants: event._count.registrations,
      location: event.location,
      instructor: event.instructor,
      image: event.image || './assets/images/default-event.webp',
      category: event.category,
      requirements: event.requirements
    }))

    return NextResponse.json({
      success: true,
      data: transformedEvents
    })

  } catch (error) {
    console.error('Chyba při načítání událostí:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při načítání událostí'
    }, { status: 500 })
  }
}

// POST /api/events - Vytvoření nové události (pro admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const event = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
        date: new Date(body.date),
        startTime: body.startTime,
        durationMinutes: body.durationMinutes,
        price: body.price,
        maxParticipants: body.maxParticipants,
        location: body.location,
        instructor: body.instructor,
        image: body.image,
        category: body.category,
        requirements: body.requirements,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Chyba při vytváření události:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při vytváření události'
    }, { status: 500 })
  }
}