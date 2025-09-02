'use client';

import { useState } from 'react';
import { Service, ReservationData } from '../ReservationWizard';

interface Props {
  data: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
  onBack: () => void;
  canGoBack: boolean;
}

const AVAILABLE_SERVICES: Service[] = [
  {
    id: 'energy-diagnosis',
    name: 'Energetické vyšetření',
    duration: 60,
    price: 1200,
    description: 'Komplexní diagnostika energetických toků a blokád v těle.'
  },
  {
    id: 'chakra-therapy',
    name: 'Chakrová terapie',
    duration: 90,
    price: 1500,
    description: 'Harmonizace a vyrovnání všech sedmi hlavních chaker.'
  },
  {
    id: 'crystal-therapy',
    name: 'Křišťálová terapie',
    duration: 75,
    price: 1300,
    description: 'Využití přirozených vibrací a energie drahokámů.'
  },
  {
    id: 'reiki-healing',
    name: 'Reiki léčení',
    duration: 60,
    price: 1100,
    description: 'Japonská technika energetického léčení a relaxace.'
  },
  {
    id: 'holistic-consultation',
    name: 'Holistická konzultace',
    duration: 120,
    price: 2000,
    description: 'Komplexní přístup k tělu, mysli a duchu s individuálním plánem.'
  }
];

export default function ServiceSelection({ data, onComplete }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(
    data.service || null
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (selectedService) {
      onComplete({ service: selectedService });
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-3">
          Vyberte službu
        </h2>
        <p className="text-muted text-lg">
          Naše centrum nabízí širokou škálu holistických služeb pro obnovu energetické rovnováhy
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {AVAILABLE_SERVICES.map((service) => (
          <div
            key={service.id}
            className={`service-card p-6 cursor-pointer ${
              selectedService?.id === service.id ? 'selected' : ''
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary mb-2">{service.name}</h3>
                <div className="flex items-center text-sm text-muted mb-2">
                  <i className="fas fa-clock mr-2"></i>
                  <span>{service.duration} minut</span>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-3 flex items-center justify-center ${
                  selectedService?.id === service.id
                    ? 'border-green bg-green'
                    : 'border-secondary'
                }`}
              >
                {selectedService?.id === service.id && (
                  <i className="fas fa-check text-white text-xs"></i>
                )}
              </div>
            </div>
            
            <p className="text-muted mb-4 leading-relaxed">{service.description}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="text-right flex-1">
                <div className="text-2xl font-bold text-green">
                  {service.price.toLocaleString('cs-CZ')} Kč
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleContinue}
          disabled={!selectedService}
          className={`px-12 py-4 font-semibold transition-all text-lg ${
            selectedService
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