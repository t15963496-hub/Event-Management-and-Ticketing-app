/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  EventItem, 
  TicketTier, 
  Attendee, 
  OrderTransaction, 
  PaymentGatewayConfig, 
  CheckInLog 
} from './types';
import { 
  initialEvents, 
  initialTiers, 
  initialAttendees, 
  initialTransactions, 
  initialPaymentConfig, 
  initialCheckInLogs 
} from './data/mockEvents';
import { Navbar } from './components/Navbar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CheckInScanner } from './components/CheckInScanner';
import { AttendeesList } from './components/AttendeesList';
import { ExpoMobileView } from './components/ExpoMobileView';
import { SecureCheckoutModal } from './components/SecureCheckoutModal';
import { PaymentSettingsModal } from './components/PaymentSettingsModal';
import { EventEditorModal } from './components/EventEditorModal';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { playSuccessBeep } from './utils/audio';
import { Bell, Sparkles, X, CheckCircle2, DollarSign } from 'lucide-react';

export default function App() {
  // App state
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('passpulse_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents[0].id);

  const [tiers, setTiers] = useState<TicketTier[]>(() => {
    const saved = localStorage.getItem('passpulse_tiers');
    return saved ? JSON.parse(saved) : initialTiers;
  });

  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const saved = localStorage.getItem('passpulse_attendees');
    return saved ? JSON.parse(saved) : initialAttendees;
  });

  const [transactions, setTransactions] = useState<OrderTransaction[]>(() => {
    const saved = localStorage.getItem('passpulse_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>(() => {
    const saved = localStorage.getItem('passpulse_payment_config');
    return saved ? JSON.parse(saved) : initialPaymentConfig;
  });

  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>(() => {
    const saved = localStorage.getItem('passpulse_checkin_logs');
    return saved ? JSON.parse(saved) : initialCheckInLogs;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'attendees' | 'expo_companion'>('dashboard');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [viewingTicketAttendee, setViewingTicketAttendee] = useState<Attendee | null>(null);

  // Live Toast notification
  const [liveToast, setLiveToast] = useState<{ id: string; title: string; message: string; type: 'sale' | 'checkin' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('passpulse_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('passpulse_tiers', JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    localStorage.setItem('passpulse_attendees', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('passpulse_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('passpulse_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('passpulse_checkin_logs', JSON.stringify(checkInLogs));
  }, [checkInLogs]);

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const currentEventTiers = tiers.filter(t => t.eventId === currentEvent.id);
  const currentEventAttendees = attendees.filter(a => a.eventId === currentEvent.id);
  const currentEventTransactions = transactions.filter(t => t.eventId === currentEvent.id);

  // Real-Time Simulation Loop (Live incoming sales and admissions)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 60% chance of ticket sale, 40% chance of door check-in
      const isSale = Math.random() > 0.4;

      if (isSale) {
        // Find an available tier
        const available = currentEventTiers.filter(t => t.soldQuantity < t.totalQuantity);
        if (available.length === 0) return;

        const randomTier = available[Math.floor(Math.random() * available.length)];
        const sampleFirstNames = ['Zoe', 'Liam', 'Maya', 'Lucas', 'Emma', 'Kai', 'Sophia', 'Ethan', 'Chloe', 'Noah'];
        const sampleLastNames = ['Vance', 'Sterling', 'Novak', 'Kim', 'Patel', 'Wright', 'Mercer', 'Zhao', 'Alvarez'];
        const randomName = `${sampleFirstNames[Math.floor(Math.random() * sampleFirstNames.length)]} ${sampleLastNames[Math.floor(Math.random() * sampleLastNames.length)]}`;
        const randomEmail = `${randomName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

        const ticketSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderSuffix = Math.floor(10000 + Math.random() * 90000);
        const prefix = randomTier.name.includes('VIP') ? 'VIP' : randomTier.name.includes('Early') ? 'EAR' : 'GEN';
        const ticketId = `TKT-${prefix}-${ticketSuffix}`;
        const attendeeId = `att-${Date.now()}`;

        const newAttendee: Attendee = {
          id: attendeeId,
          ticketId,
          eventId: currentEvent.id,
          orderId: `ORD-${orderSuffix}`,
          name: randomName,
          email: randomEmail,
          phone: '+1 (555) 019-8822',
          tierId: randomTier.id,
          tierName: randomTier.name,
          purchaseDate: 'Just now',
          pricePaid: randomTier.price,
          currency: randomTier.currency,
          checkInStatus: 'not_checked_in',
          qrCodeData: `${ticketId}-${randomName.toUpperCase()}`
        };

        const newTransaction: OrderTransaction = {
          id: `tx_${Math.random().toString(36).substring(2, 10)}`,
          eventId: currentEvent.id,
          attendeeId,
          attendeeName: randomName,
          attendeeEmail: randomEmail,
          tierId: randomTier.id,
          tierName: randomTier.name,
          quantity: 1,
          subtotal: randomTier.price,
          fees: +(randomTier.price * 0.029 + 0.30).toFixed(2),
          totalAmount: +(randomTier.price + randomTier.price * 0.029 + 0.30).toFixed(2),
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: {
            type: 'card',
            brand: 'Visa',
            last4: String(Math.floor(1000 + Math.random() * 9000))
          },
          paymentIntentId: `pi_live_${Math.random().toString(36).substring(2, 12)}`,
          createdAt: 'Just now',
          riskScore: 'low'
        };

        // Increment tier sold
        setTiers(prev => prev.map(t => t.id === randomTier.id ? { ...t, soldQuantity: t.soldQuantity + 1 } : t));
        setAttendees(prev => [newAttendee, ...prev]);
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Add to Stripe available balance
        setPaymentConfig(prev => ({
          ...prev,
          availableBalance: prev.availableBalance + randomTier.price
        }));

        setLiveToast({
          id: String(Date.now()),
          title: 'Live Ticket Sale Processed',
          message: `${randomName} purchased 1x ${randomTier.name} ($${randomTier.price})`,
          type: 'sale'
        });
      } else {
        // Door check-in simulation
        const unchecked = currentEventAttendees.filter(a => a.checkInStatus === 'not_checked_in');
        if (unchecked.length > 0) {
          const target = unchecked[Math.floor(Math.random() * unchecked.length)];
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const gates = ['Gate A - FastTrack VIP', 'Gate B - North Turnstile', 'Gate C - Main Atrium'];
          const randomGate = gates[Math.floor(Math.random() * gates.length)];

          setAttendees(prev => prev.map(a => a.id === target.id ? {
            ...a,
            checkInStatus: 'checked_in',
            checkInTime: nowStr,
            checkInGate: randomGate
          } : a));

          setCheckInLogs(prev => [
            {
              id: `log-${Date.now()}`,
              ticketId: target.ticketId,
              attendeeName: target.name,
              tierName: target.tierName,
              timestamp: nowStr,
              status: 'success',
              gate: randomGate,
              staff: 'Auto Terminal 02'
            },
            ...prev
          ]);

          playSuccessBeep();

          setLiveToast({
            id: String(Date.now()),
            title: 'Gate Admission Verified',
            message: `${target.name} admitted at ${randomGate}`,
            type: 'checkin'
          });
        }
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulating, currentEventTiers, currentEventAttendees, currentEvent.id]);

  // Auto-dismiss toast
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Check-in action from scanner or list
  const handleCheckIn = (attendeeId: string, gate: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let attendeeObj: Attendee | undefined;

    setAttendees(prev => prev.map(a => {
      if (a.id === attendeeId) {
        attendeeObj = a;
        return {
          ...a,
          checkInStatus: 'checked_in',
          checkInTime: nowStr,
          checkInGate: gate
        };
      }
      return a;
    }));

    if (attendeeObj) {
      setCheckInLogs(prev => [
        {
          id: `log-${Date.now()}`,
          ticketId: attendeeObj!.ticketId,
          attendeeName: attendeeObj!.name,
          tierName: attendeeObj!.tierName,
          timestamp: nowStr,
          status: 'success',
          gate,
          staff: 'Staff Officer'
        },
        ...prev
      ]);
    }
  };

  const handleUndoCheckIn = (attendeeId: string) => {
    setAttendees(prev => prev.map(a => {
      if (a.id === attendeeId) {
        return {
          ...a,
          checkInStatus: 'not_checked_in',
          checkInTime: undefined,
          checkInGate: undefined
        };
      }
      return a;
    }));
  };

  const handleCheckInToggle = (attendeeId: string) => {
    const target = attendees.find(a => a.id === attendeeId);
    if (!target) return;
    if (target.checkInStatus === 'checked_in') {
      handleUndoCheckIn(attendeeId);
    } else {
      handleCheckIn(attendeeId, 'Gate A - FastTrack VIP');
    }
  };

  const handleSuccessCheckout = (newAttendee: Attendee, newTransaction: OrderTransaction, tierId: string) => {
    setAttendees(prev => [newAttendee, ...prev]);
    setTransactions(prev => [newTransaction, ...prev]);
    setTiers(prev => prev.map(t => t.id === tierId ? { ...t, soldQuantity: t.soldQuantity + 1 } : t));
    setPaymentConfig(prev => ({
      ...prev,
      availableBalance: prev.availableBalance + newAttendee.pricePaid
    }));
  };

  const handleSaveEvent = (updatedEvent: EventItem, updatedTiers: TicketTier[]) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setTiers(prev => {
      const otherTiers = prev.filter(t => t.eventId !== updatedEvent.id);
      return [...otherTiers, ...updatedTiers];
    });
  };

  const handleAddManualAttendee = (newAtt: Partial<Attendee>) => {
    setAttendees(prev => [newAtt as Attendee, ...prev]);
  };

  return (
    <div id="passpulse-app-root" className="min-h-screen bg-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={(ev) => setSelectedEventId(ev.id)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenPaymentSettings={() => setIsPaymentSettingsOpen(true)}
        onOpenEventEditor={() => setIsEventEditorOpen(true)}
        paymentConfig={paymentConfig}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Real-time notification banner if simulation active */}
        {isSimulating && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold">Live Real-Time Simulation Streaming</span>
              <span>— Simulating live ticket sales and door admissions every 7 seconds.</span>
            </div>
            <button
              onClick={() => setIsSimulating(false)}
              className="text-xs underline font-semibold text-emerald-900 hover:text-emerald-700"
            >
              Pause Stream
            </button>
          </div>
        )}

        {/* TAB 1: Real-time Analytics Dashboard */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            event={currentEvent}
            tiers={currentEventTiers}
            attendees={currentEventAttendees}
            transactions={currentEventTransactions}
            paymentConfig={paymentConfig}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            onOpenPaymentSettings={() => setIsPaymentSettingsOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* TAB 2: Door Staff Check-In Scanner */}
        {activeTab === 'scanner' && (
          <CheckInScanner
            attendees={currentEventAttendees}
            checkInLogs={checkInLogs}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />
        )}

        {/* TAB 3: Attendee Management Directory */}
        {activeTab === 'attendees' && (
          <AttendeesList
            attendees={currentEventAttendees}
            tiers={currentEventTiers}
            event={currentEvent}
            onCheckInToggle={handleCheckInToggle}
            onViewTicket={(att) => setViewingTicketAttendee(att)}
            onAddAttendee={handleAddManualAttendee}
          />
        )}

        {/* TAB 4: React Native Expo Mobile Companion & Exporter */}
        {activeTab === 'expo_companion' && (
          <ExpoMobileView
            event={currentEvent}
            tiers={currentEventTiers}
            attendees={currentEventAttendees}
            transactions={currentEventTransactions}
            paymentConfig={paymentConfig}
            checkInLogs={checkInLogs}
            onCheckIn={handleCheckIn}
            onViewTicket={(att) => setViewingTicketAttendee(att)}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

      </main>

      {/* Floating Live Event Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 max-w-sm">
            <div className={`p-2 rounded-xl shrink-0 ${
              liveToast.type === 'sale' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {liveToast.type === 'sale' ? <DollarSign className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs block text-slate-100">{liveToast.title}</span>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">{liveToast.message}</p>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Secure Organizer Checkout */}
      <SecureCheckoutModal
        event={currentEvent}
        tiers={currentEventTiers}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleSuccessCheckout}
      />

      {/* MODAL 2: Organizer Stripe Gateway Configuration */}
      <PaymentSettingsModal
        config={paymentConfig}
        isOpen={isPaymentSettingsOpen}
        onClose={() => setIsPaymentSettingsOpen(false)}
        onUpdateConfig={setPaymentConfig}
      />

      {/* MODAL 3: Event & Tiers Editor */}
      <EventEditorModal
        event={currentEvent}
        tiers={currentEventTiers}
        isOpen={isEventEditorOpen}
        onClose={() => setIsEventEditorOpen(false)}
        onSave={handleSaveEvent}
      />

      {/* MODAL 4: Digital Pass & QR Code */}
      {viewingTicketAttendee && (
        <DigitalTicketModal
          attendee={viewingTicketAttendee}
          event={currentEvent}
          tier={currentEventTiers.find(t => t.id === viewingTicketAttendee.tierId)}
          onClose={() => setViewingTicketAttendee(null)}
        />
      )}

    </div>
  );
}
