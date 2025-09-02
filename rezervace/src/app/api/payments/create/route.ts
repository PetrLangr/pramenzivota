import { NextResponse } from 'next/server';
import { createPaymentProvider } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      appointmentId, 
      amount, 
      currency = 'CZK',
      paymentMethod = 'comgate',
      customerInfo,
      description 
    } = body;

    // Validace
    if (!appointmentId || !amount || !customerInfo) {
      return NextResponse.json(
        { success: false, error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Vytvoř platební provider
    const paymentProvider = createPaymentProvider(paymentMethod);
    
    // Vytvoř platbu
    const paymentResult = await paymentProvider.createPayment({
      amount,
      currency,
      appointmentId,
      customerInfo,
      description: description || `Rezervace služby - ${customerInfo.name}`,
      returnUrl: `${process.env.APP_URL}/reservation/success?id=${appointmentId}`,
      cancelUrl: `${process.env.APP_URL}/reservation/cancel?id=${appointmentId}`
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      );
    }

    // Zde by se uložil platební záznam do databáze
    // await prisma.payment.create({...});

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId
      }
    });
  } catch (error) {
    console.error('Chyba při vytváření platby:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při vytváření platby' },
      { status: 500 }
    );
  }
}