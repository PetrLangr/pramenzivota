'use client';

import { useState } from 'react';

interface CalendarAppointment {
  id: string;
  startTime: string;
  endTime: string;
  customerName: string;
  serviceName: string;
  employeeName: string;
  status: string;
  serviceColor: string;
}

const mockAppointments: CalendarAppointment[] = [
  {
    id: '1',
    startTime: '2024-08-30T09:00:00',
    endTime: '2024-08-30T10:00:00',
    customerName: 'Anna Nováková',
    serviceName: 'Energetické vyšetření',
    employeeName: 'Dr. Svoboda',
    status: 'APPROVED',
    serviceColor: '#3B82F6'
  },
  {
    id: '2',
    startTime: '2024-08-30T14:00:00',
    endTime: '2024-08-30T15:00:00', 
    customerName: 'Josef Novák',
    serviceName: 'Reiki léčení',
    employeeName: 'Mgr. Krásná',
    status: 'PENDING',
    serviceColor: '#10B981'
  }
];

export default function AppointmentsCalendar() {
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const weekDays = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getAppointmentForSlot = (day: number, hour: string) => {
    // Deterministická logika místo Math.random()
    return mockAppointments.find(app => {
      const appDate = new Date(app.startTime);
      const appHour = appDate.getHours().toString().padStart(2, '0') + ':00';
      const appDay = appDate.getDate();
      return appHour === hour && appDay === (26 + day); // Pevně definované datum
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {formatDate(currentDate)}
            </h2>
            <button 
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <button 
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            onClick={() => setCurrentDate(new Date())}
          >
            Dnes
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {(['day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === view
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {view === 'day' && 'Den'}
              {view === 'week' && 'Týden'}
              {view === 'month' && 'Měsíc'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid - Week View */}
      {currentView === 'week' && (
        <div className="p-6">
          <div className="grid grid-cols-8 gap-1">
            {/* Time column */}
            <div className="space-y-1">
              <div className="h-12"></div> {/* Header space */}
              {timeSlots.map((time) => (
                <div key={time} className="h-20 flex items-start justify-end pr-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {time}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-1">
                {/* Day header */}
                <div className="h-12 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{day}</div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const weekStart = new Date(currentDate);
                        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1 + dayIndex);
                        return weekStart.getDate();
                      })()}
                    </div>
                  </div>
                </div>

                {/* Time slots */}
                {timeSlots.map((time) => {
                  const appointment = getAppointmentForSlot(dayIndex, time);
                  
                  return (
                    <div key={time} className="h-20 border border-gray-200 rounded relative">
                      {appointment && (
                        <div 
                          className="absolute inset-1 rounded text-white text-xs p-2 cursor-pointer hover:shadow-lg transition-shadow"
                          style={{ backgroundColor: appointment.serviceColor }}
                          title={`${appointment.customerName} - ${appointment.serviceName}`}
                        >
                          <div className="font-medium">{appointment.customerName}</div>
                          <div className="text-xs opacity-90">{appointment.serviceName}</div>
                          <div className="text-xs opacity-75">{appointment.employeeName}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {currentView === 'month' && (
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gray-900 bg-gray-50 rounded">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 42 }, (_, i) => {
              // Reálný kalendář pro vybraný měsíc
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const firstDayOfWeek = firstDay.getDay(); // 0 = neděle
              const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // pondělí = 0
              
              const cellDate = new Date(firstDay);
              cellDate.setDate(cellDate.getDate() - startOffset + i);
              
              const dayNumber = cellDate.getDate();
              const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
              const isToday = cellDate.toDateString() === new Date().toDateString();
              
              // Simulace rezervací pro tento den
              const appointmentCount = isCurrentMonth && dayNumber % 4 === 0 ? dayNumber % 3 + 1 : 0;
              
              return (
                <div key={i} className={`h-24 border border-gray-200 rounded p-1 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}>
                  <div className={`text-sm font-medium ${
                    !isCurrentMonth ? 'text-gray-400' : 
                    isToday ? 'text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center' : 
                    'text-gray-900'
                  }`}>
                    {dayNumber}
                  </div>
                  
                  {appointmentCount > 0 && isCurrentMonth && (
                    <div className="mt-1 space-y-1">
                      {Array.from({ length: Math.min(appointmentCount, 2) }, (_, j) => (
                        <div key={j} className="text-xs bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 truncate">
                          Rezervace #{j + 1}
                        </div>
                      ))}
                      {appointmentCount > 2 && (
                        <div className="text-xs text-gray-500">
                          +{appointmentCount - 2} dalších
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Schválená</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span className="text-gray-600">Čeká na schválení</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Zrušená</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-600">Dokončená</span>
          </div>
        </div>
      </div>
    </div>
  );
}