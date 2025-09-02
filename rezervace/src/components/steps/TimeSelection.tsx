'use client';

import { useState, useEffect } from 'react';
import { TimeSlot, ReservationData } from '../ReservationWizard';

interface Props {
  data: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
  onBack: () => void;
  canGoBack: boolean;
}

// Mock data pro dostupné termíny
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  // Generuje termíny pro následujících 14 dní
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Přeskočí víkendy
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Časové sloty od 9:00 do 17:00
    const times = [
      '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00'
    ];
    
    times.forEach(time => {
      slots.push({
        date: dateStr,
        time,
        available: Math.random() > 0.3 // 70% šance že je dostupný
      });
    });
  }
  
  return slots;
};

export default function TimeSelection({ data, onComplete, onBack, canGoBack }: Props) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(
    data.timeSlot || null
  );
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const slots = generateTimeSlots();
    setAvailableSlots(slots);
    
    if (slots.length > 0) {
      setSelectedDate(slots[0].date);
    }
  }, []);

  const dates = [...new Set(availableSlots.map(slot => slot.date))];
  const timeSlotsForSelectedDate = availableSlots.filter(slot => 
    slot.date === selectedDate
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleContinue = () => {
    if (selectedSlot) {
      onComplete({ timeSlot: selectedSlot });
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-3">
          Vyberte termín
        </h2>
        {data.service && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-l-4 border-secondary">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Vybraná služba</p>
                <p className="font-bold text-primary text-lg">{data.service.name}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Délka</p>
                <p className="font-bold text-secondary">{data.service.duration} minut</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Cena</p>
                <p className="font-bold text-green text-lg">{data.service.price.toLocaleString('cs-CZ')} Kč</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Výběr data */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Vyberte datum</h3>
          <div className="space-y-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedDate === date
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Výběr času */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">
            Dostupné časy
            {selectedDate && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {formatDate(selectedDate)}
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {timeSlotsForSelectedDate.map((slot) => (
              <button
                key={`${slot.date}-${slot.time}`}
                onClick={() => handleSlotSelect(slot)}
                disabled={!slot.available}
                className={`time-slot p-4 text-center font-medium ${
                  !slot.available
                    ? 'disabled'
                    : selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                    ? 'selected'
                    : ''
                }`}
              >
                <div className="text-lg">{slot.time}</div>
                {!slot.available && (
                  <div className="text-xs mt-1">
                    <i className="fas fa-times-circle mr-1"></i>
                    Obsazeno
                  </div>
                )}
                {slot.available && selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && (
                  <div className="text-xs mt-1 text-green">
                    <i className="fas fa-check-circle mr-1"></i>
                    Vybráno
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-10">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="btn-secondary px-6 py-3"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Zpět
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className={`px-12 py-4 font-semibold transition-all text-lg ${
            selectedSlot
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
          }`}
        >
          <i className="fas fa-arrow-right mr-2"></i>
          Pokračovat
        </button>
      </div>
    </div>
  );
}