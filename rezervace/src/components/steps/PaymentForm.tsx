'use client';

import { useState } from 'react';
import { ReservationData } from '../ReservationWizard';

interface Props {
  data: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
  onBack: () => void;
  canGoBack: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export default function PaymentForm({ data, onComplete, onBack, canGoBack }: Props) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: data.customerInfo?.name || '',
    email: data.customerInfo?.email || '',
    phone: data.customerInfo?.phone || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank-transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return customerInfo.name.trim() && 
           customerInfo.email.trim() && 
           customerInfo.phone.trim() &&
           customerInfo.email.includes('@');
  };

  const handlePayment = async () => {
    if (!isFormValid()) return;
    
    setIsProcessing(true);
    
    // Simulace platebního procesu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete({ 
      customerInfo,
      paymentInfo: {
        method: paymentMethod,
        status: 'completed'
      }
    });
    
    setIsProcessing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-3">
          Kontaktní údaje a platba
        </h2>
        <p className="text-muted text-lg">
          Již jen krok od dokončení rezervace
        </p>
      </div>

      {/* Souhrn rezervace */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Souhrn rezervace</h3>
        
        {data.service && data.timeSlot && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Služba:</span>
              <span className="font-medium">{data.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Datum:</span>
              <span className="font-medium">
                {formatDate(data.timeSlot.date)} v {data.timeSlot.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Délka:</span>
              <span className="font-medium">{data.service.duration} minut</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Celková cena:</span>
              <span className="text-green-600">
                {data.service.price.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Kontaktní údaje */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Kontaktní údaje</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input w-full"
                placeholder="Vaše jméno"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input w-full"
                placeholder="vas.email@priklad.cz"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input w-full"
                placeholder="+420 123 456 789"
                required
              />
            </div>
          </div>
        </div>

        {/* Způsob platby */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Způsob platby</h3>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Platební karta</div>
                <div className="text-sm text-gray-500">
                  Visa, Mastercard - okamžitá platba
                </div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="bank-transfer"
                checked={paymentMethod === 'bank-transfer'}
                onChange={(e) => setPaymentMethod(e.target.value as 'bank-transfer')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Bankovní převod</div>
                <div className="text-sm text-gray-500">
                  Platba na účet - rezervace do 24h
                </div>
              </div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Zrušení rezervace:</strong> Možné do 24 hodin před termínem.
              Při včasném zrušení vrátime 100% částky.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={!canGoBack || isProcessing}
          className="btn-secondary px-6 py-3 disabled:opacity-50"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Zpět
        </button>
        
        <button
          onClick={handlePayment}
          disabled={!isFormValid() || isProcessing}
          className={`px-12 py-4 font-semibold transition-all flex items-center text-lg ${
            isFormValid() && !isProcessing
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Zpracováváme...
            </>
          ) : (
            `Zaplatit ${data.service?.price.toLocaleString('cs-CZ')} Kč`
          )}
        </button>
      </div>
    </div>
  );
}