'use client';

import { useState } from 'react';
import ServiceSelection from './steps/ServiceSelection';
import TimeSelection from './steps/TimeSelection';
import PaymentForm from './steps/PaymentForm';
import ThankYou from './steps/ThankYou';

export interface Service {
  id: string;
  name: string;
  duration: number; // minuty
  price: number; // CZK
  description: string;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface ReservationData {
  service?: Service;
  timeSlot?: TimeSlot;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentInfo?: {
    method: 'card' | 'bank-transfer';
    status: 'pending' | 'completed' | 'failed';
  };
}

const STEPS = [
  { id: 1, title: 'Výběr služby', component: ServiceSelection },
  { id: 2, title: 'Výběr termínu', component: TimeSelection },
  { id: 3, title: 'Platba', component: PaymentForm },
  { id: 4, title: 'Potvrzení', component: ThankYou },
];

export default function ReservationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({});

  const handleStepComplete = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = STEPS.find(step => step.id === currentStep);
  if (!currentStepData) return null;

  const StepComponent = currentStepData.component;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header s logem a gradientem */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <img 
            src="/pramen_zivota_logo_header.png" 
            alt="Pramen života s.r.o." 
            className="mx-auto h-16 w-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
          Rezervace služeb
        </h1>
        <p className="text-blue-100 text-lg">
          Centrum energetické rovnováhy
        </p>
      </div>

      {/* Progress bar - přepracovaný design */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id <= currentStep ? 'text-white' : 'text-blue-200'
              }`}
            >
              <div
                className={`w-12 h-12 mx-auto rounded-full border-3 flex items-center justify-center mb-3 font-semibold ${
                  step.id < currentStep
                    ? 'bg-white border-white text-primary-dark-blue shadow-lg'
                    : step.id === currentStep
                    ? 'border-white text-white bg-blue-600/20 backdrop-blur-sm'
                    : 'border-blue-300/50 text-blue-300'
                }`}
              >
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <span className="text-sm font-medium tracking-wide">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="progress-container h-3">
          <div
            className="progress-bar h-3"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step content - s novým designem */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <StepComponent
          data={reservationData}
          onComplete={handleStepComplete}
          onBack={handleBack}
          canGoBack={currentStep > 1}
        />
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-blue-100">
        <p className="text-sm">
          Máte otázky? Zavolejte nám na +420 123 456 789
        </p>
      </div>
    </div>
  );
}