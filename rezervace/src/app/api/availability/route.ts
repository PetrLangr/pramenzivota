import { NextResponse } from 'next/server';

// Mock data pro dostupnost basovanou na reálném kalendáři
function generateAvailabilityForMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const availability = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isPast = date < today;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let status = 'available';
    if (isPast) status = 'past';
    else if (isWeekend) status = 'unavailable';
    else if (Math.random() < 0.15) status = 'booked';    // 15% obsazeno
    else if (Math.random() < 0.1) status = 'pending';    // 10% pending

    availability.push({
      date: dateStr,
      day: day,
      dayOfWeek: dayOfWeek,
      availability: status
    });
  }

  return availability;
}

function generateTimeSlotsForDate(date: string) {
  const timeSlots = [];
  const workingHours = [
    { start: 9, end: 12 },   // Dopoledne
    { start: 14, end: 17 }   // Odpoledne
  ];

  workingHours.forEach(({ start, end }) => {
    for (let hour = start; hour < end; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      
      timeSlots.push({
        time: timeString,
        available: Math.random() > 0.3, // 70% dostupnost
        date: date
      });
    }
  });

  return timeSlots;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'calendar' or 'times'
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (type === 'calendar') {
      // Vrať kalendářní data pro měsíc
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      const currentMonth = month ? parseInt(month) : new Date().getMonth();
      
      const monthData = {
        year: currentYear,
        month: currentMonth,
        monthName: new Date(currentYear, currentMonth).toLocaleDateString('cs-CZ', { 
          month: 'long', 
          year: 'numeric' 
        }),
        days: generateAvailabilityForMonth(currentYear, currentMonth)
      };

      return NextResponse.json({
        success: true,
        data: monthData
      });
    }

    if (type === 'times' && date) {
      // Vrať dostupné časy pro konkrétní datum
      const timeSlots = generateTimeSlotsForDate(date);

      return NextResponse.json({
        success: true,
        data: {
          date,
          slots: timeSlots
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Neplatný typ požadavku' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chyba při načítání dostupnosti:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání dostupnosti' },
      { status: 500 }
    );
  }
}