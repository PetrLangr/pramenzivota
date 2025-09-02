import { NextResponse } from 'next/server';

// Mock data pro rezervace
const mockAppointments = [
  {
    id: '1',
    serviceId: 'energy-diagnosis',
    employeeId: '1',
    customerId: '1',
    startDateTime: '2024-08-30T09:00:00Z',
    endDateTime: '2024-08-30T10:00:00Z',
    status: 'APPROVED',
    totalPrice: 1200,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');

    let filteredAppointments = mockAppointments;

    // Filtruj podle data
    if (date) {
      filteredAppointments = filteredAppointments.filter(app => 
        app.startDateTime.startsWith(date)
      );
    }

    // Filtruj podle zaměstnance
    if (employeeId) {
      filteredAppointments = filteredAppointments.filter(app => 
        app.employeeId === employeeId
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredAppointments
    });
  } catch (error) {
    console.error('Chyba při načítání rezervací:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání rezervací' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validace vstupních dat
    const { 
      serviceId, 
      employeeId, 
      startDateTime, 
      customerInfo, 
      paymentMethod 
    } = body;
    
    if (!serviceId || !employeeId || !startDateTime || !customerInfo) {
      return NextResponse.json(
        { success: false, error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Kontrola dostupnosti termínu
    const existingAppointment = mockAppointments.find(app => 
      app.employeeId === employeeId && 
      app.startDateTime === startDateTime &&
      app.status !== 'CANCELED'
    );

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Termín je již obsazen' },
        { status: 409 }
      );
    }

    // Zde by bylo vytvoření rezervace v databázi
    // 1. Vytvoř nebo najdi zákazníka
    // 2. Vytvoř rezervaci
    // 3. Vytvoř platební záznam
    // 4. Pošli notifikační e-maily

    const newAppointment = {
      id: `appointment_${Date.now()}`,
      serviceId,
      employeeId,
      customerId: `customer_${Date.now()}`,
      startDateTime,
      endDateTime: new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      totalPrice: 1200, // Načteno ze služby
      paymentMethod,
      paymentStatus: paymentMethod === 'ON_SITE' ? 'PENDING' : 'PENDING',
      customerInfo,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newAppointment,
      message: 'Rezervace byla úspěšně vytvořena'
    });
  } catch (error) {
    console.error('Chyba při vytváření rezervace:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při vytváření rezervace' },
      { status: 500 }
    );
  }
}