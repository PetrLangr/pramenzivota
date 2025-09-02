// Platební systém inspirovaný Amelia - modulární approach

export interface PaymentProvider {
  name: string;
  createPayment(data: PaymentData): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentVerification>;
}

export interface PaymentData {
  amount: number;
  currency: string;
  appointmentId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED';
  transactionId: string;
  amount: number;
  currency: string;
}

// Comgate provider implementation
export class ComgateProvider implements PaymentProvider {
  name = 'Comgate';
  
  private merchantId: string;
  private secret: string;
  private testMode: boolean;

  constructor(merchantId: string, secret: string, testMode = true) {
    this.merchantId = merchantId;
    this.secret = secret;
    this.testMode = testMode;
  }

  async createPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      // Comgate API volání pro vytvoření platby
      const comgateData = {
        merchant: this.merchantId,
        price: Math.round(data.amount * 100), // Comgate očekává halíře
        curr: data.currency,
        label: data.description,
        refId: data.appointmentId,
        email: data.customerInfo.email,
        phone: data.customerInfo.phone || '',
        name: data.customerInfo.name,
        returnURL: data.returnUrl,
        cancelURL: data.cancelUrl,
        test: this.testMode ? 'true' : 'false'
      };

      // Mock Comgate response (v reálném systému HTTP call)
      if (this.testMode) {
        return {
          success: true,
          paymentUrl: `https://payments.comgate.cz/client/instructions/index?id=mock_${Date.now()}`,
          transactionId: `comgate_${Date.now()}`
        };
      }

      // Zde by byl skutečný Comgate API call
      // const response = await fetch('https://payments.comgate.cz/v1.0/create', {...});
      
      return {
        success: false,
        error: 'Comgate integrace zatím není implementována v produkci'
      };
    } catch (error) {
      return {
        success: false,
        error: `Chyba Comgate: ${error}`
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    // Mock verification
    return {
      success: true,
      status: 'PAID',
      transactionId,
      amount: 1200,
      currency: 'CZK'
    };
  }
}

// Stripe provider implementation (budoucí rozšíření)
export class StripeProvider implements PaymentProvider {
  name = 'Stripe';

  async createPayment(data: PaymentData): Promise<PaymentResult> {
    // Stripe implementace
    return {
      success: false,
      error: 'Stripe integrace zatím není implementována'
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    return {
      success: false,
      status: 'FAILED',
      transactionId,
      amount: 0,
      currency: 'CZK'
    };
  }
}

// Factory pro vytvoření platebního providera
export function createPaymentProvider(method: string): PaymentProvider {
  switch (method) {
    case 'comgate':
      return new ComgateProvider(
        process.env.COMGATE_MERCHANT_ID || '',
        process.env.COMGATE_SECRET || '',
        process.env.COMGATE_TEST_MODE === 'true'
      );
    case 'stripe':
      return new StripeProvider();
    default:
      throw new Error(`Nepodporovaný platební provider: ${method}`);
  }
}