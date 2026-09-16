import React from 'react';
import { EventItem, PaymentGatewayConfig } from '../types';
import { 
  Ticket, 
  Activity, 
  Smartphone, 
  Monitor, 
  Zap, 
  CreditCard, 
  Calendar, 
  Settings, 
  CheckCircle2,
  Play,
  Pause,
  Plus
} from 'lucide-react';

interface NavbarProps {
  events: EventItem[];
  currentEvent: EventItem;
  onSelectEvent: (event: EventItem) => void;
  activeTab: 'dashboard' | 'scanner' | 'attendees' | 'expo_companion';
  onTabChange: (tab: 'dashboard' | 'scanner' | 'attendees' | 'expo_companion') => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenCheckout: () => void;
  onOpenPaymentSettings: () => void;
  onOpenEventEditor: () => void;
  paymentConfig: PaymentGatewayConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  currentEvent,
  onSelectEvent,
  activeTab,
  onTabChange,
  isSimulating,
  onToggleSimulation,
  onOpenCheckout,
  onOpenPaymentSettings,
  onOpenEventEditor,
  paymentConfig
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Event Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Ticket className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">PassPulse</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm bg-indigo-100 text-indigo-700">
                    EXPO+WEB
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Event Ticketing & Check-In
                </span>
              </div>
            </div>

            {/* Event Dropdown */}
            <div className="relative">
              <select
                id="event-picker-dropdown"
                value={currentEvent.id}
                onChange={(e) => {
                  const found = events.find(ev => ev.id === e.target.value);
                  if (found) onSelectEvent(found);
                }}
                className="text-xs font-bold py-1.5 pl-2.5 pr-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 focus:outline-hidden cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="edit-event-details-btn"
              onClick={onOpenEventEditor}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              title="Edit Event & Tiers"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Analytics</span>
            </button>

            <button
              id="nav-tab-scanner"
              onClick={() => onTabChange('scanner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'scanner'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Door Scanner</span>
            </button>

            <button
              id="nav-tab-attendees"
              onClick={() => onTabChange('attendees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'attendees'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Attendees</span>
            </button>

            <button
              id="nav-tab-expo"
              onClick={() => onTabChange('expo_companion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'expo_companion'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Expo Mobile App</span>
            </button>
          </nav>

          {/* Right Actions: Live Stream Toggle, Stripe, Process Sale */}
          <div className="flex items-center space-x-2">
            
            {/* Live Traffic Simulator Button */}
            <button
              id="live-simulation-toggle-btn"
              onClick={onToggleSimulation}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                isSimulating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Simulates real-time ticket purchases and gate admissions every few seconds"
            >
              {isSimulating ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="hidden sm:inline">Live Flow: Active</span>
                  <Pause className="w-3 h-3 text-emerald-600" />
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-500" />
                  <span className="hidden sm:inline">Start Real-Time Stream</span>
                </>
              )}
            </button>

            {/* Stripe Merchant Payout */}
            <button
              id="navbar-stripe-settings-btn"
              onClick={onOpenPaymentSettings}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Stripe Connect Merchant Settings"
            >
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">Stripe Connect</span>
            </button>

            {/* Sell Ticket Modal Button */}
            <button
              id="navbar-sell-ticket-btn"
              onClick={onOpenCheckout}
              className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sell Ticket</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row (under 768px) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`py-1 px-2.5 rounded-lg ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => onTabChange('scanner')}
            className={`py-1 px-2.5 rounded-lg ${activeTab === 'scanner' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}
          >
            Scanner
          </button>
          <button
            onClick={() => onTabChange('attendees')}
            className={`py-1 px-2.5 rounded-lg ${activeTab === 'attendees' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}
          >
            Attendees
          </button>
          <button
            onClick={() => onTabChange('expo_companion')}
            className={`py-1 px-2.5 rounded-lg ${activeTab === 'expo_companion' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}
          >
            Expo Mobile
          </button>
        </div>

      </div>
    </header>
  );
};
