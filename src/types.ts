export type EventStatus = 'live' | 'draft' | 'upcoming' | 'completed';

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  totalQuantity: number;
  soldQuantity: number;
  perks: string[];
  color: string;
  salesEnd: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  time: string;
  timezone: string;
  venueName: string;
  address: string;
  isVirtual: boolean;
  bannerUrl: string;
  status: EventStatus;
  capacity: number;
  organizer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    stripeAccountId: string;
  };
}

export interface Attendee {
  id: string;
  ticketId: string;
  eventId: string;
  orderId: string;
  name: string;
  email: string;
  phone: string;
  tierId: string;
  tierName: string;
  purchaseDate: string;
  pricePaid: number;
  currency: string;
  checkInStatus: 'not_checked_in' | 'checked_in';
  checkInTime?: string;
  checkInGate?: string;
  qrCodeData: string;
  notes?: string;
}

export interface OrderTransaction {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  tierId: string;
  tierName: string;
  quantity: number;
  subtotal: number;
  fees: number;
  totalAmount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentMethod: {
    type: 'card' | 'apple_pay' | 'google_pay';
    brand?: string;
    last4?: string;
  };
  paymentIntentId: string;
  createdAt: string;
  riskScore: 'low' | 'medium' | 'high';
}

export interface PaymentGatewayConfig {
  provider: 'stripe_connect';
  accountId: string;
  accountName: string;
  status: 'connected' | 'restricted' | 'pending';
  instantPayoutsEnabled: boolean;
  currency: string;
  feePayer: 'attendee' | 'organizer';
  platformFeePercent: number;
  stripeFeePercent: number;
  stripeFeeFixed: number;
  bankAccount: {
    bankName: string;
    last4: string;
    routingNumber: string;
  };
  statementDescriptor: string;
  availableBalance: number;
  pendingBalance: number;
}

export interface CheckInLog {
  id: string;
  ticketId: string;
  attendeeName: string;
  tierName: string;
  timestamp: string;
  status: 'success' | 'duplicate' | 'invalid';
  gate: string;
  staff: string;
}
