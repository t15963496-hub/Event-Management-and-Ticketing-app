import { EventItem, TicketTier, Attendee, OrderTransaction, PaymentGatewayConfig, CheckInLog } from '../types';

export const initialEvents: EventItem[] = [
  {
    id: 'evt-2026-summit',
    title: 'PulseNext Global Developer Summit 2026',
    slug: 'pulsenext-summit-2026',
    description: 'The premier annual gathering of tech innovators, AI researchers, and distributed systems architects. 3 days of keynotes, workshops, and high-impact networking.',
    category: 'Technology & AI',
    date: 'Oct 24 - 26, 2026',
    time: '09:00 AM PST',
    timezone: 'America/Los_Angeles',
    venueName: 'Moscone West Convention Center',
    address: '747 Howard St, San Francisco, CA 94103',
    isVirtual: false,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    status: 'live',
    capacity: 1200,
    organizer: {
      id: 'org-101',
      name: 'Nexus Events Group',
      email: 'events@nexusgroup.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      stripeAccountId: 'acct_1Nv0K82eZvKYlo2C'
    }
  },
  {
    id: 'evt-2026-music',
    title: 'Aetheria Electronic Sound & Visuals 2026',
    slug: 'aetheria-sound-visuals-2026',
    description: 'Immersive multi-sensory audiovisual electronic festival featuring global headliners and interactive spatial audio stages.',
    category: 'Music & Arts',
    date: 'Nov 12 - 14, 2026',
    time: '04:00 PM PST',
    timezone: 'America/Los_Angeles',
    venueName: 'The Midway Waterfront Amphitheater',
    address: '900 Marin St, San Francisco, CA 94124',
    isVirtual: false,
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80',
    status: 'upcoming',
    capacity: 2500,
    organizer: {
      id: 'org-101',
      name: 'Nexus Events Group',
      email: 'events@nexusgroup.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      stripeAccountId: 'acct_1Nv0K82eZvKYlo2C'
    }
  }
];

export const initialTiers: TicketTier[] = [
  {
    id: 'tier-early',
    eventId: 'evt-2026-summit',
    name: 'Early Bird Pass',
    description: 'Full conference access, keynotes, exhibition floor, and welcome mixer. Limited allocation.',
    price: 199,
    currency: 'USD',
    totalQuantity: 300,
    soldQuantity: 300,
    perks: ['Full Conference Access', 'Lunch & Coffee Breaks', 'Attendee Lounge Access'],
    color: '#3b82f6',
    salesEnd: '2026-09-01'
  },
  {
    id: 'tier-standard',
    eventId: 'evt-2026-summit',
    name: 'General Admission',
    description: 'Standard attendee badge with access to all stages, breakout sessions, and sponsor exhibits.',
    price: 349,
    currency: 'USD',
    totalQuantity: 600,
    soldQuantity: 442,
    perks: ['All Stage Access', 'Expo Floor', 'Keynote Recordings Archive', 'Event Swag Bag'],
    color: '#10b981',
    salesEnd: '2026-10-23'
  },
  {
    id: 'tier-vip',
    eventId: 'evt-2026-summit',
    name: 'VIP All-Access',
    description: 'Executive front-row seating, speakers lounge, private dinners, and direct Q&A breakout rooms.',
    price: 799,
    currency: 'USD',
    totalQuantity: 200,
    soldQuantity: 178,
    perks: ['Priority Front-Row Seating', 'VIP Lounge & Catered Meals', 'Speaker Dinner Pass', 'Fast-Track Check-In Lane'],
    color: '#8b5cf6',
    salesEnd: '2026-10-23'
  },
  {
    id: 'tier-workshop',
    eventId: 'evt-2026-summit',
    name: 'Hands-on AI Lab Pass',
    description: 'Exclusive hands-on technical workshop ticket with certified instructors and cloud compute credits.',
    price: 499,
    currency: 'USD',
    totalQuantity: 100,
    soldQuantity: 76,
    perks: ['Hands-on Lab Seat', '$300 Cloud Credits', 'Workshop Certificate', 'Dedicated Mentorship'],
    color: '#f59e0b',
    salesEnd: '2026-10-22'
  }
];

export const initialAttendees: Attendee[] = [
  {
    id: 'att-01',
    ticketId: 'TKT-VIP-8492',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98214',
    name: 'Elena Rostova',
    email: 'elena.rostova@synapse.ai',
    phone: '+1 (415) 555-0192',
    tierId: 'tier-vip',
    tierName: 'VIP All-Access',
    purchaseDate: '2026-09-04 14:22',
    pricePaid: 799,
    currency: 'USD',
    checkInStatus: 'checked_in',
    checkInTime: '2026-10-24 08:35 AM',
    checkInGate: 'Gate A - FastTrack VIP',
    qrCodeData: 'TKT-VIP-8492-ELENA-ROSTOVA',
    notes: 'Speaker guest speaker dinner confirmed'
  },
  {
    id: 'att-02',
    ticketId: 'TKT-GEN-4103',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98190',
    name: 'Marcus Chen',
    email: 'marcus.chen@quantumflow.dev',
    phone: '+1 (650) 555-0184',
    tierId: 'tier-standard',
    tierName: 'General Admission',
    purchaseDate: '2026-09-08 09:15',
    pricePaid: 349,
    currency: 'USD',
    checkInStatus: 'checked_in',
    checkInTime: '2026-10-24 08:48 AM',
    checkInGate: 'Gate B - North Turnstile',
    qrCodeData: 'TKT-GEN-4103-MARCUS-CHEN'
  },
  {
    id: 'att-03',
    ticketId: 'TKT-VIP-8812',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98175',
    name: 'Sarah Jenkins',
    email: 'sjenkins@vanguardcap.com',
    phone: '+1 (212) 555-0143',
    tierId: 'tier-vip',
    tierName: 'VIP All-Access',
    purchaseDate: '2026-09-10 11:40',
    pricePaid: 799,
    currency: 'USD',
    checkInStatus: 'checked_in',
    checkInTime: '2026-10-24 08:52 AM',
    checkInGate: 'Gate A - FastTrack VIP',
    qrCodeData: 'TKT-VIP-8812-SARAH-JENKINS'
  },
  {
    id: 'att-04',
    ticketId: 'TKT-GEN-5521',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98144',
    name: 'David Okafor',
    email: 'd.okafor@lagostech.ng',
    phone: '+234 802 555 0177',
    tierId: 'tier-standard',
    tierName: 'General Admission',
    purchaseDate: '2026-09-12 16:30',
    pricePaid: 349,
    currency: 'USD',
    checkInStatus: 'not_checked_in',
    qrCodeData: 'TKT-GEN-5521-DAVID-OKAFOR'
  },
  {
    id: 'att-05',
    ticketId: 'TKT-LAB-9102',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98129',
    name: 'Aria Takahashi',
    email: 'aria.t@tokyorobotics.jp',
    phone: '+81 90 5555 0123',
    tierId: 'tier-workshop',
    tierName: 'Hands-on AI Lab Pass',
    purchaseDate: '2026-09-13 18:05',
    pricePaid: 499,
    currency: 'USD',
    checkInStatus: 'not_checked_in',
    qrCodeData: 'TKT-LAB-9102-ARIA-TAKAHASHI'
  },
  {
    id: 'att-06',
    ticketId: 'TKT-EAR-1093',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-97880',
    name: 'Carlos Mendez',
    email: 'carlos@hypermesh.io',
    phone: '+1 (512) 555-0162',
    tierId: 'tier-early',
    tierName: 'Early Bird Pass',
    purchaseDate: '2026-08-15 10:20',
    pricePaid: 199,
    currency: 'USD',
    checkInStatus: 'checked_in',
    checkInTime: '2026-10-24 09:02 AM',
    checkInGate: 'Gate C - Main Atrium',
    qrCodeData: 'TKT-EAR-1093-CARLOS-MENDEZ'
  },
  {
    id: 'att-07',
    ticketId: 'TKT-GEN-6729',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98010',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@parislabs.fr',
    phone: '+33 6 55 50 19 82',
    tierId: 'tier-standard',
    tierName: 'General Admission',
    purchaseDate: '2026-09-14 13:45',
    pricePaid: 349,
    currency: 'USD',
    checkInStatus: 'not_checked_in',
    qrCodeData: 'TKT-GEN-6729-CHLOE-DUBOIS'
  },
  {
    id: 'att-08',
    ticketId: 'TKT-VIP-9941',
    eventId: 'evt-2026-summit',
    orderId: 'ORD-98240',
    name: 'Liam Sterling',
    email: 'liam@sterlingventures.co.uk',
    phone: '+44 20 7946 0912',
    tierId: 'tier-vip',
    tierName: 'VIP All-Access',
    purchaseDate: '2026-09-15 15:10',
    pricePaid: 799,
    currency: 'USD',
    checkInStatus: 'not_checked_in',
    qrCodeData: 'TKT-VIP-9941-LIAM-STERLING'
  }
];

export const initialTransactions: OrderTransaction[] = [
  {
    id: 'tx_3Pv991',
    eventId: 'evt-2026-summit',
    attendeeId: 'att-08',
    attendeeName: 'Liam Sterling',
    attendeeEmail: 'liam@sterlingventures.co.uk',
    tierId: 'tier-vip',
    tierName: 'VIP All-Access',
    quantity: 1,
    subtotal: 799,
    fees: 26.35,
    totalAmount: 825.35,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: {
      type: 'card',
      brand: 'Visa',
      last4: '4242'
    },
    paymentIntentId: 'pi_3Pv991K82eZvKYlo2C8891',
    createdAt: '2 mins ago',
    riskScore: 'low'
  },
  {
    id: 'tx_3Pv982',
    eventId: 'evt-2026-summit',
    attendeeId: 'att-07',
    attendeeName: 'Chloe Dubois',
    attendeeEmail: 'chloe.dubois@parislabs.fr',
    tierId: 'tier-standard',
    tierName: 'General Admission',
    quantity: 1,
    subtotal: 349,
    fees: 11.90,
    totalAmount: 360.90,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: {
      type: 'apple_pay',
      brand: 'Mastercard',
      last4: '8821'
    },
    paymentIntentId: 'pi_3Pv982K82eZvKYlo2C9912',
    createdAt: '18 mins ago',
    riskScore: 'low'
  },
  {
    id: 'tx_3Pv974',
    eventId: 'evt-2026-summit',
    attendeeId: 'att-05',
    attendeeName: 'Aria Takahashi',
    attendeeEmail: 'aria.t@tokyorobotics.jp',
    tierId: 'tier-workshop',
    tierName: 'Hands-on AI Lab Pass',
    quantity: 1,
    subtotal: 499,
    fees: 16.85,
    totalAmount: 515.85,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: {
      type: 'card',
      brand: 'Amex',
      last4: '1004'
    },
    paymentIntentId: 'pi_3Pv974K82eZvKYlo2C1044',
    createdAt: '42 mins ago',
    riskScore: 'low'
  },
  {
    id: 'tx_3Pv960',
    eventId: 'evt-2026-summit',
    attendeeId: 'att-01',
    attendeeName: 'Elena Rostova',
    attendeeEmail: 'elena.rostova@synapse.ai',
    tierId: 'tier-vip',
    tierName: 'VIP All-Access',
    quantity: 1,
    subtotal: 799,
    fees: 26.35,
    totalAmount: 825.35,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: {
      type: 'google_pay',
      brand: 'Visa',
      last4: '9901'
    },
    paymentIntentId: 'pi_3Pv960K82eZvKYlo2C3312',
    createdAt: '1 hour ago',
    riskScore: 'low'
  }
];

export const initialPaymentConfig: PaymentGatewayConfig = {
  provider: 'stripe_connect',
  accountId: 'acct_1Nv0K82eZvKYlo2C',
  accountName: 'Nexus Events Group LLC',
  status: 'connected',
  instantPayoutsEnabled: true,
  currency: 'USD',
  feePayer: 'attendee',
  platformFeePercent: 2.5,
  stripeFeePercent: 2.9,
  stripeFeeFixed: 0.30,
  bankAccount: {
    bankName: 'JPMorgan Chase & Co.',
    last4: '4198',
    routingNumber: '121000358'
  },
  statementDescriptor: 'PULSENEXT*TICKETS',
  availableBalance: 42890.50,
  pendingBalance: 12450.00
};

export const initialCheckInLogs: CheckInLog[] = [
  {
    id: 'log-01',
    ticketId: 'TKT-VIP-8492',
    attendeeName: 'Elena Rostova',
    tierName: 'VIP All-Access',
    timestamp: '08:35 AM',
    status: 'success',
    gate: 'Gate A - FastTrack VIP',
    staff: 'Officer Ramirez'
  },
  {
    id: 'log-02',
    ticketId: 'TKT-GEN-4103',
    attendeeName: 'Marcus Chen',
    tierName: 'General Admission',
    timestamp: '08:48 AM',
    status: 'success',
    gate: 'Gate B - North Turnstile',
    staff: 'Staff Davis'
  },
  {
    id: 'log-03',
    ticketId: 'TKT-VIP-8812',
    attendeeName: 'Sarah Jenkins',
    tierName: 'VIP All-Access',
    timestamp: '08:52 AM',
    status: 'success',
    gate: 'Gate A - FastTrack VIP',
    staff: 'Officer Ramirez'
  },
  {
    id: 'log-04',
    ticketId: 'TKT-EAR-1093',
    attendeeName: 'Carlos Mendez',
    tierName: 'Early Bird Pass',
    timestamp: '09:02 AM',
    status: 'success',
    gate: 'Gate C - Main Atrium',
    staff: 'Staff Morgan'
  }
];
