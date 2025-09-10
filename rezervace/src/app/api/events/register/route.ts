import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// POST /api/events/register - Registrace na událost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, participantInfo, paymentMethod, gdprConsent } = body

    // Validace povinných polí
    if (!eventId || !participantInfo?.name || !participantInfo?.email || !participantInfo?.phone) {
      return NextResponse.json({
        success: false,
        error: 'Chybí povinné údaje'
      }, { status: 400 })
    }

    if (!gdprConsent) {
      return NextResponse.json({
        success: false,
        error: 'Je nutný souhlas se zpracováním osobních údajů'
      }, { status: 400 })
    }

    // Zkontroluj, zda událost existuje a je dostupná
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Událost nebyla nalezena'
      }, { status: 404 })
    }

    if (!event.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Událost není aktivní'
      }, { status: 400 })
    }

    if (event._count.registrations >= event.maxParticipants) {
      return NextResponse.json({
        success: false,
        error: 'Událost je již plně obsazena'
      }, { status: 400 })
    }

    if (new Date(event.date) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Nelze se registrovat na událost v minulosti'
      }, { status: 400 })
    }

    // Zkontroluj, zda už není účastník registrován
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        email: participantInfo.email
      }
    })

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        error: 'Na tuto událost jste již registrováni'
      }, { status: 400 })
    }

    // Vytvoř registraci
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: eventId,
        name: participantInfo.name,
        email: participantInfo.email,
        phone: participantInfo.phone,
        experience: participantInfo.experience || '',
        paymentMethod: paymentMethod.toUpperCase(),
        status: paymentMethod === 'card' ? 'PENDING' : 'CONFIRMED',
        gdprConsent: gdprConsent
      },
      include: {
        event: true
      }
    })

    // Odeslání potvrzovacího e-mailu
    try {
      await sendRegistrationConfirmation(registration)
    } catch (emailError) {
      console.error('Chyba při odesílání e-mailu:', emailError)
      // Nepřerušuj proces kvůli e-mailu
    }

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        eventName: event.name,
        participantName: registration.name,
        status: registration.status
      }
    })

  } catch (error) {
    console.error('Chyba při registraci na událost:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při registraci na událost'
    }, { status: 500 })
  }
}

async function sendRegistrationConfirmation(registration: { 
  name: string; 
  email: string; 
  phone: string; 
  event: { name: string; date: Date; startTime: string; location: string; instructor: string; }; 
}) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1E3A5F; text-align: center;">Potvrzení registrace</h1>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h2 style="color: #2E86AB; margin-top: 0;">Děkujeme za registraci!</h2>
        <p>Vaše registrace na událost byla úspěšně zpracována.</p>
        
        <h3 style="color: #1E3A5F;">Detaily události:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Název:</strong> ${registration.event.name}</li>
          <li><strong>Datum:</strong> ${formatDate(registration.event.date)}</li>
          <li><strong>Čas:</strong> ${registration.event.startTime}</li>
          <li><strong>Místo:</strong> ${registration.event.location}</li>
          <li><strong>Instruktor:</strong> ${registration.event.instructor}</li>
        </ul>
        
        <h3 style="color: #1E3A5F;">Vaše údaje:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Jméno:</strong> ${registration.name}</li>
          <li><strong>E-mail:</strong> ${registration.email}</li>
          <li><strong>Telefon:</strong> ${registration.phone}</li>
        </ul>
      </div>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1976d2; margin-top: 0;">Důležité informace:</h3>
        <ul>
          <li>Dostavte se prosím 15 minut před začátkem</li>
          <li>V ceně jsou zahrnuty všechny potřebné materiály</li>
          <li>Zrušení je možné do 7 dnů před akcí</li>
          <li>Při dotazech volejte +420 123 456 789</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        Pramen života s.r.o. - Centrum energetické rovnováhy<br>
        E-mail: info@pramenzivota.cz | Tel: +420 123 456 789
      </p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@pramenzivota.cz',
    to: registration.email,
    subject: `Potvrzení registrace - ${registration.event.name}`,
    html: htmlContent
  })
}