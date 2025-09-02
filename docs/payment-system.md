# Platební systém - Pramen života

Kompletní dokumentace platebního systému s podporou Stripe a připravenou integrací pro Comgate jako standalone modul.

## 🏗 Architektura platebního systému

```
┌─────────────────────────────────────────────────────────────┐
│                PAYMENT PROVIDER INTERFACE                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │     STRIPE      │  │    COMGATE      │  │     MOCK      │ │
│  │ (Implementováno)│  │  (Připraveno)   │  │  (Testing)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────── │
├─────────────────────────────────────────────────────────────┤
│                     RESERVATION FLOW                       │
│  Rezervace → Platba → Webhook → Potvrzení → Email         │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Payment Provider Interface

### Abstraktní interface pro všechny payment providery

```typescript
// src/lib/payments/PaymentProvider.ts
export interface PaymentProvider {
  name: string;
  
  /**
   * Vytvoření checkout session pro platbu
   */
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse>;
  
  /**
   * Ověření webhook podpisu
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
  
  /**
   * Zpracování webhook eventu
   */
  processWebhookEvent(event: WebhookEvent): Promise<WebhookProcessResult>;
  
  /**
   * Získání detailu platby
   */
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
  
  /**
   * Refund platby (pro admin)
   */
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
}

export interface CreateCheckoutSessionParams {
  reservationId: string;
  courseId: string;
  courseName: string;
  amountCZK: number;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  paymentUrl: string;
  expiresAt: Date;
}

export interface WebhookEvent {
  type: string;
  data: any;
  metadata?: Record<string, string>;
}

export interface WebhookProcessResult {
  processed: boolean;
  reservationId?: string;
  status?: 'PAID' | 'FAILED' | 'CANCELLED';
  paymentRef?: string;
  amountCZK?: number;
  error?: string;
}

export interface PaymentDetails {
  id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  amountCZK: number;
  currency: string;
  customerEmail: string;
  createdAt: Date;
  metadata: Record<string, string>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amountRefunded?: number;
  error?: string;
}
```

## 💳 Stripe Implementation

### Stripe provider implementace

```typescript
// src/lib/payments/stripe.ts
import Stripe from 'stripe';
import { PaymentProvider, CreateCheckoutSessionParams, CheckoutSessionResponse } from './PaymentProvider';

export class StripeProvider implements PaymentProvider {
  name = 'stripe';
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: params.courseName,
              description: 'Rezervace kurzu v Pramen života',
            },
            unit_amount: params.amountCZK,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minut
      metadata: {
        reservationId: params.reservationId,
        courseId: params.courseId,
        provider: 'stripe',
        ...params.metadata,
      },
      // Pouze CZK locale a češtiny
      locale: 'cs',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url!,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error);
      return false;
    }
  }

  async processWebhookEvent(event: any): Promise<any> {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event.data.object);
      
      case 'payment_intent.payment_failed':
        return this.handlePaymentFailed(event.data.object);
      
      case 'checkout.session.expired':
        return this.handleCheckoutExpired(event.data.object);
      
      default:
        return { processed: false };
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const reservationId = session.metadata?.reservationId;
    
    if (!reservationId) {
      throw new Error('Missing reservation ID in Stripe session metadata');
    }

    return {
      processed: true,
      reservationId,
      status: 'PAID' as const,
      paymentRef: session.id,
      amountCZK: session.amount_total,
    };
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Najít checkout session podle payment intent
    const sessions = await this.stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });

    const session = sessions.data[0];
    const reservationId = session?.metadata?.reservationId;

    if (!reservationId) {
      return { processed: false };
    }

    return {
      processed: true,
      reservationId,
      status: 'FAILED' as const,
      paymentRef: paymentIntent.id,
    };
  }

  private async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const reservationId = session.metadata?.reservationId;
    
    if (!reservationId) {
      return { processed: false };
    }

    return {
      processed: true,
      reservationId,
      status: 'CANCELLED' as const,
      paymentRef: session.id,
    };
  }

  async getPaymentDetails(sessionId: string): Promise<PaymentDetails> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      id: session.id,
      status: this.mapStripeStatus(session.payment_status),
      amountCZK: session.amount_total || 0,
      currency: session.currency || 'czk',
      customerEmail: session.customer_details?.email || '',
      createdAt: new Date(session.created * 1000),
      metadata: session.metadata || {},
    };
  }

  async refundPayment(sessionId: string, amount?: number): Promise<any> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.payment_intent) {
      throw new Error('No payment intent found for session');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: session.payment_intent as string,
      amount: amount,
      metadata: {
        sessionId,
        refund_reason: 'admin_refund',
      },
    });

    return {
      success: true,
      refundId: refund.id,
      amountRefunded: refund.amount,
    };
  }

  private mapStripeStatus(status: string): 'pending' | 'succeeded' | 'failed' | 'cancelled' {
    switch (status) {
      case 'paid':
        return 'succeeded';
      case 'unpaid':
        return 'pending';
      case 'no_payment_required':
        return 'succeeded';
      default:
        return 'failed';
    }
  }
}
```

## 🏦 Comgate Implementation (připravená struktura)

### Comgate provider skeleton

```typescript
// src/lib/payments/comgate.ts
import { PaymentProvider, CreateCheckoutSessionParams, CheckoutSessionResponse } from './PaymentProvider';
import { createHash } from 'crypto';

export class ComgateProvider implements PaymentProvider {
  name = 'comgate';
  private merchantId: string;
  private secretKey: string;
  private testMode: boolean;

  constructor() {
    this.merchantId = process.env.COMGATE_MERCHANT_ID!;
    this.secretKey = process.env.COMGATE_SECRET_KEY!;
    this.testMode = process.env.NODE_ENV !== 'production';
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
    const transactionData = {
      merchant: this.merchantId,
      price: params.amountCZK, // Comgate očekává haléře
      currency: 'CZK',
      label: params.courseName,
      refId: params.reservationId,
      method: 'ALL', // Všechny platební metody
      email: params.customerEmail,
      lang: 'cs',
      test: this.testMode ? 'true' : 'false',
    };

    // Vytvoření bezpečnostního hash
    const secret = this.generateSecret(transactionData);
    
    const response = await fetch('https://payments.comgate.cz/v1.0/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...transactionData,
        secret,
      }),
    });

    const result = await response.text();
    const parsedResult = this.parseComgateResponse(result);

    if (parsedResult.code !== '0') {
      throw new Error(`Comgate error: ${parsedResult.message}`);
    }

    return {
      sessionId: parsedResult.transId,
      paymentUrl: parsedResult.redirect,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minut
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Comgate používá jiný způsob ověření
    const expectedSignature = createHash('sha256')
      .update(payload + secret)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  async processWebhookEvent(event: any): Promise<any> {
    // Comgate webhook processing
    const { status, refId, transId, price } = event;

    switch (status) {
      case 'PAID':
        return {
          processed: true,
          reservationId: refId,
          status: 'PAID' as const,
          paymentRef: transId,
          amountCZK: parseInt(price),
        };
      
      case 'CANCELLED':
        return {
          processed: true,
          reservationId: refId,
          status: 'CANCELLED' as const,
          paymentRef: transId,
        };
      
      default:
        return { processed: false };
    }
  }

  async getPaymentDetails(transId: string): Promise<any> {
    const requestData = {
      merchant: this.merchantId,
      transId,
      test: this.testMode ? 'true' : 'false',
    };

    const secret = this.generateSecret(requestData);

    const response = await fetch('https://payments.comgate.cz/v1.0/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...requestData,
        secret,
      }),
    });

    const result = await response.text();
    const parsedResult = this.parseComgateResponse(result);

    return {
      id: transId,
      status: this.mapComgateStatus(parsedResult.status),
      amountCZK: parseInt(parsedResult.price || '0'),
      currency: 'CZK',
      customerEmail: parsedResult.email || '',
      createdAt: new Date(parsedResult.created || Date.now()),
      metadata: { refId: parsedResult.refId },
    };
  }

  async refundPayment(transId: string, amount?: number): Promise<any> {
    // Comgate refund implementation
    throw new Error('Comgate refund not implemented yet');
  }

  private generateSecret(data: Record<string, string>): string {
    const values = Object.keys(data)
      .sort()
      .map(key => data[key])
      .join('');
    
    return createHash('sha256')
      .update(values + this.secretKey)
      .digest('hex');
  }

  private parseComgateResponse(response: string): Record<string, string> {
    const lines = response.split('\\n');
    const result: Record<string, string> = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        result[key] = value;
      }
    });
    
    return result;
  }

  private mapComgateStatus(status: string): 'pending' | 'succeeded' | 'failed' | 'cancelled' {
    switch (status) {
      case 'PAID':
        return 'succeeded';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'failed';
    }
  }
}
```

## 🔧 Payment Manager

### Centrální správa payment providerů

```typescript
// src/lib/payments/PaymentManager.ts
import { PaymentProvider } from './PaymentProvider';
import { StripeProvider } from './stripe';
import { ComgateProvider } from './comgate';
import { MockPaymentProvider } from './mock';

export class PaymentManager {
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    // Registrace dostupných providerů
    this.registerProvider(new StripeProvider());
    this.registerProvider(new ComgateProvider());
    this.registerProvider(new MockPaymentProvider());

    // Výchozí provider z konfigurace
    this.defaultProvider = process.env.DEFAULT_PAYMENT_PROVIDER || 'stripe';
  }

  private registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name?: string): PaymentProvider {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }
    
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async switchProvider(newProvider: string): Promise<void> {
    if (!this.providers.has(newProvider)) {
      throw new Error(`Provider '${newProvider}' is not available`);
    }
    
    this.defaultProvider = newProvider;
    
    // Aktualizace v databázi
    await this.updateSystemSetting('payment.default_provider', newProvider);
  }

  private async updateSystemSetting(key: string, value: string) {
    const { prisma } = await import('../prisma');
    
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

// Singleton instance
export const paymentManager = new PaymentManager();
```

## 🔗 API Integration

### Vytvoření checkout session

```typescript
// src/app/api/payments/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentManager } from '@/lib/payments/PaymentManager';
import { prisma } from '@/lib/prisma';

const checkoutSchema = z.object({
  reservationId: z.string().cuid(),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId, provider } = checkoutSchema.parse(body);

    // Načtení rezervace
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { Course: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Reservation is not pending' },
        { status: 400 }
      );
    }

    // Získání payment providera
    const paymentProvider = paymentManager.getProvider(provider);

    // Vytvoření checkout session
    const session = await paymentProvider.createCheckoutSession({
      reservationId: reservation.id,
      courseId: reservation.courseId,
      courseName: reservation.Course.title,
      amountCZK: reservation.Course.priceCZK,
      customerEmail: reservation.email,
      customerName: reservation.fullName,
      successUrl: `${process.env.NEXTAUTH_URL}/rezervace/${reservation.id}/potvrzeni?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/kurzy/${reservation.Course.slug}?payment=cancelled`,
      metadata: {
        courseSlug: reservation.Course.slug,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Univerzální webhook handler

```typescript
// src/app/api/webhooks/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { paymentManager } from '@/lib/payments/PaymentManager';
import { prisma } from '@/lib/prisma';
import { sendReservationConfirmationEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  
  // Detekce providera ze specifických headerů
  const provider = detectProviderFromHeaders(headersList);
  
  if (!provider) {
    return NextResponse.json(
      { error: 'Unknown payment provider' },
      { status: 400 }
    );
  }

  try {
    const paymentProvider = paymentManager.getProvider(provider);
    
    // Verifikace podpisu
    const signature = getSignatureFromHeaders(headersList, provider);
    const webhookSecret = getWebhookSecret(provider);
    
    if (!paymentProvider.verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parsování eventu
    const event = parseWebhookEvent(body, provider);
    
    // Zpracování eventu
    const result = await paymentProvider.processWebhookEvent(event);
    
    if (!result.processed) {
      return NextResponse.json({ received: true });
    }

    // Aktualizace rezervace
    await updateReservationStatus(result);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function detectProviderFromHeaders(headers: Headers): string | null {
  if (headers.get('stripe-signature')) return 'stripe';
  if (headers.get('comgate-signature')) return 'comgate';
  return null;
}

function getSignatureFromHeaders(headers: Headers, provider: string): string {
  switch (provider) {
    case 'stripe':
      return headers.get('stripe-signature') || '';
    case 'comgate':
      return headers.get('comgate-signature') || '';
    default:
      return '';
  }
}

function getWebhookSecret(provider: string): string {
  switch (provider) {
    case 'stripe':
      return process.env.STRIPE_WEBHOOK_SECRET!;
    case 'comgate':
      return process.env.COMGATE_WEBHOOK_SECRET!;
    default:
      throw new Error(`No webhook secret for provider: ${provider}`);
  }
}

function parseWebhookEvent(body: string, provider: string): any {
  switch (provider) {
    case 'stripe':
      return JSON.parse(body);
    case 'comgate':
      // Comgate může posílat URL-encoded data
      return new URLSearchParams(body);
    default:
      return JSON.parse(body);
  }
}

async function updateReservationStatus(result: any) {
  if (!result.reservationId) return;

  const updateData: any = {
    status: result.status,
    paymentRef: result.paymentRef,
    updatedAt: new Date(),
  };

  if (result.amountCZK) {
    updateData.amountCZK = result.amountCZK;
  }

  const reservation = await prisma.reservation.update({
    where: { id: result.reservationId },
    data: updateData,
    include: {
      Course: true,
    },
  });

  // Odeslání potvrzovacího emailu při úspěšné platbě
  if (result.status === 'PAID') {
    await sendReservationConfirmationEmail(reservation);
  }

  console.log(`Reservation ${result.reservationId} updated to ${result.status}`);
}
```

## ⚙️ Admin konfigurace

### Přepínání payment providerů v admin panelu

```typescript
// src/app/(admin)/admin/nastaveni/page.tsx
import { paymentManager } from '@/lib/payments/PaymentManager';
import { PaymentProviderSettings } from '@/components/admin/payment-provider-settings';

export default async function SettingsPage() {
  const availableProviders = paymentManager.getAvailableProviders();
  const currentProvider = process.env.DEFAULT_PAYMENT_PROVIDER || 'stripe';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Nastavení systému</h1>
      
      <PaymentProviderSettings
        availableProviders={availableProviders}
        currentProvider={currentProvider}
      />
    </div>
  );
}
```

### Payment provider settings komponenta

```typescript
// src/components/admin/payment-provider-settings.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentProviderSettingsProps {
  availableProviders: string[];
  currentProvider: string;
}

export function PaymentProviderSettings({ 
  availableProviders, 
  currentProvider 
}: PaymentProviderSettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState(currentProvider);
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderChange = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/settings/payment-provider', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
        }),
      });

      if (response.ok) {
        // Reload stránky pro aktualizaci
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating payment provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platební systém</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Aktuální provider:</span>
          <Badge variant="default">{currentProvider}</Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider === 'stripe' ? 'Stripe' : 
                   provider === 'comgate' ? 'ComGate' : 
                   provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleProviderChange}
            disabled={selectedProvider === currentProvider || isLoading}
            loading={isLoading}
          >
            Změnit provider
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-medium mb-2">Dostupné providery:</h4>
          <ul className="space-y-1">
            <li><strong>Stripe:</strong> Mezinárodní platební brána s podporou karet</li>
            <li><strong>ComGate:</strong> České platební řešení s podporou bank a karet</li>
            <li><strong>Mock:</strong> Testovací provider pro development</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🧪 Mock Provider pro testování

```typescript
// src/lib/payments/mock.ts
import { PaymentProvider, CreateCheckoutSessionParams, CheckoutSessionResponse } from './PaymentProvider';

export class MockPaymentProvider implements PaymentProvider {
  name = 'mock';

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
    // Simulace vytvoření session
    const sessionId = `mock_session_${Date.now()}`;
    
    return {
      sessionId,
      paymentUrl: `${process.env.NEXTAUTH_URL}/mock-payment?session_id=${sessionId}&reservation_id=${params.reservationId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  verifyWebhookSignature(): boolean {
    return true; // Mock vždy projde
  }

  async processWebhookEvent(event: any): Promise<any> {
    return {
      processed: true,
      reservationId: event.reservationId,
      status: 'PAID' as const,
      paymentRef: `mock_payment_${Date.now()}`,
      amountCZK: event.amount || 50000,
    };
  }

  async getPaymentDetails(sessionId: string): Promise<any> {
    return {
      id: sessionId,
      status: 'succeeded' as const,
      amountCZK: 50000,
      currency: 'CZK',
      customerEmail: 'test@example.com',
      createdAt: new Date(),
      metadata: {},
    };
  }

  async refundPayment(): Promise<any> {
    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
      amountRefunded: 50000,
    };
  }
}
```

## 📊 Environment konfigurace

### Environment variables pro payment systém

```env
# Default payment provider
DEFAULT_PAYMENT_PROVIDER=stripe

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...

# ComGate
COMGATE_MERCHANT_ID=your_merchant_id
COMGATE_SECRET_KEY=your_secret_key
COMGATE_WEBHOOK_SECRET=your_webhook_secret

# Payment URLs
PAYMENT_SUCCESS_URL=https://yourdomain.com/rezervace/{reservationId}/potvrzeni
PAYMENT_CANCEL_URL=https://yourdomain.com/kurzy
```

## 🔄 Standalone modul pro CMS

### Export pro integraci do firemního CMS

```typescript
// src/lib/payments/standalone-module.ts
export class PramenZivotaPaymentModule {
  private paymentManager: PaymentManager;

  constructor(config: PaymentModuleConfig) {
    this.paymentManager = new PaymentManager();
    // Konfigurace podle externího CMS
  }

  /**
   * Vytvoření platby z externího CMS
   */
  async createPaymentFromCMS(params: CMSPaymentParams) {
    const provider = this.paymentManager.getProvider(params.preferredProvider);
    
    return await provider.createCheckoutSession({
      reservationId: params.externalId,
      courseId: params.courseId,
      courseName: params.itemName,
      amountCZK: params.amountCZK,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });
  }

  /**
   * Webhook handler pro externí CMS
   */
  async handleWebhookFromCMS(payload: string, signature: string, provider: string) {
    const paymentProvider = this.paymentManager.getProvider(provider);
    const webhookSecret = this.getWebhookSecretForProvider(provider);
    
    if (!paymentProvider.verifyWebhookSignature(payload, signature, webhookSecret)) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(payload);
    return await paymentProvider.processWebhookEvent(event);
  }

  /**
   * Získání detailů platby pro CMS
   */
  async getPaymentDetailsForCMS(paymentId: string, provider: string) {
    const paymentProvider = this.paymentManager.getProvider(provider);
    return await paymentProvider.getPaymentDetails(paymentId);
  }
}

interface PaymentModuleConfig {
  defaultProvider: string;
  webhookSecrets: Record<string, string>;
  baseUrl: string;
}

interface CMSPaymentParams {
  externalId: string;
  courseId: string;
  itemName: string;
  amountCZK: number;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  preferredProvider?: string;
}
```

---

Tento platební systém poskytuje flexibilní a rozšiřitelné řešení s možností snadného přepínání mezi různými payment providery a integrací jako standalone modul do firemního CMS.