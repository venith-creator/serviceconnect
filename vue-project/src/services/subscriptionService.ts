import {API_BASE_URL} from "@/config";

// Payment method types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  trialPeriodDays: number;
}

export interface Subscription {
  id: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
  defaultPaymentMethod: string | null;
  latestInvoice?: {
    id: string;
    amountDue: number;
    amountPaid: number;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    hostedInvoiceUrl: string;
    invoicePdf: string;
  };
}

export interface IService {
  category: string
  rate: number
  availability: string
  radiusKm: number
  status: string
  trialEndsAt: string
  subscriptionExpiresAt: string
  approved: boolean
  rejectionReason: string
  requiresPayment: string
  _id: string
}

export interface Payment {
  _id: string;
  provider: string;
  service: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

class SubscriptionService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(token && {'Authorization': `Bearer ${token}`}),
      ...(options.headers || {})
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getProviderServices() {
    return this.request<IService[]>('/provider-profiles/me/services');
  }

  // Payment Intents
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, any> = {}) {
    return this.request<{ url: string }>('/payments/create', {
      method: 'POST',
      body: JSON.stringify({amount, currency, metadata})
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    return this.request<{ status: string; nextAction?: any }>(
      `/payment-intents/${paymentIntentId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({paymentMethodId})
      }
    );
  }
}

export default new SubscriptionService();
