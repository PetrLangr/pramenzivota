'use client';

import { ReservationData } from '../ReservationWizard';

interface Props {
  data: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
  onBack: () => void;
  canGoBack: boolean;
}

export default function ThankYou({ data }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateReservationId = () => {
    return `PZ${Date.now().toString().slice(-6)}`;
  };

  const reservationId = generateReservationId();

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-32 h-32 bg-gradient-to-br from-green to-secondary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
        <i className="fas fa-check text-white text-4xl"></i>
      </div>

      <h2 className="text-4xl font-bold text-primary mb-4">
        Rezervace úspěšně vytvořena!
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Děkujeme za vaši rezervaci. Všechny podrobnosti jsme vám zaslali na e-mail.
      </p>

      {/* Reservation details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">
          Detaily rezervace
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Číslo rezervace:</span>
            <span className="font-mono font-semibold">{reservationId}</span>
          </div>
          
          {data.service && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Služba:</span>
              <span className="font-medium">{data.service.name}</span>
            </div>
          )}
          
          {data.timeSlot && (
            <>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Datum:</span>
                <span className="font-medium">
                  {formatDate(data.timeSlot.date)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Čas:</span>
                <span className="font-medium">{data.timeSlot.time}</span>
              </div>
            </>
          )}
          
          {data.customerInfo && (
            <>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Jméno:</span>
                <span className="font-medium">{data.customerInfo.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">E-mail:</span>
                <span className="font-medium">{data.customerInfo.email}</span>
              </div>
            </>
          )}
          
          {data.service && (
            <div className="flex justify-between pt-2">
              <span className="text-gray-600 font-semibold">Celková cena:</span>
              <span className="font-bold text-green-600 text-lg">
                {data.service.price.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-blue-800 mb-3">Co dál?</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">📧</span>
            <span>Potvrzení rezervace obdržíte na váš e-mail do 15 minut</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📱</span>
            <span>Den před termínem vám pošleme SMS připomínku</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🏢</span>
            <span>Dostavte se 10 minut před začátkem terapie</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">❓</span>
            <span>Pro jakékoli dotazy nás kontaktujte na tel: +420 123 456 789</span>
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="space-y-6">
        <button
          onClick={() => window.print()}
          className="btn-secondary px-8 py-3"
        >
          <i className="fas fa-print mr-2"></i>
          Vytisknout potvrzení
        </button>
        
        <div className="flex space-x-4 justify-center">
          <a
            href="/"
            className="btn-secondary px-6 py-3"
          >
            <i className="fas fa-home mr-2"></i>
            Zpět na web
          </a>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3"
          >
            <i className="fas fa-plus mr-2"></i>
            Nová rezervace
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          Pramen života s.r.o. - Centrum energetické rovnováhy
        </p>
        <p className="text-gray-500 text-sm">
          Praha • Tel: +420 123 456 789 • info@pramenzivota.cz
        </p>
      </div>
    </div>
  );
}