import React, { useState } from 'react';
import { EventItem, TicketTier, Attendee, OrderTransaction, PaymentGatewayConfig } from '../types';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  BarChart3, 
  Sparkles,
  Zap,
  Activity,
  CreditCard,
  Building,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AnalyticsDashboardProps {
  event: EventItem;
  tiers: TicketTier[];
  attendees: Attendee[];
  transactions: OrderTransaction[];
  paymentConfig: PaymentGatewayConfig;
  onOpenCheckout: () => void;
  onOpenPaymentSettings: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  event,
  tiers,
  attendees,
  transactions,
  paymentConfig,
  onOpenCheckout,
  onOpenPaymentSettings,
  onNavigateTab
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | 'all'>('today');

  // Computed metrics
  const totalTicketsSold = tiers.reduce((acc, t) => acc + t.soldQuantity, 0);
  const grossSales = tiers.reduce((acc, t) => acc + (t.soldQuantity * t.price), 0);
  
  // Organizer net payout calculation (based on Stripe Connect fee policy)
  const stripeFeeTotal = grossSales * 0.029 + (totalTicketsSold * 0.30);
  const platformFeeTotal = grossSales * (paymentConfig.platformFeePercent / 100);
  const netOrganizerPayout = paymentConfig.feePayer === 'attendee' 
    ? grossSales 
    : grossSales - stripeFeeTotal - platformFeeTotal;

  const totalCapacity = event.capacity;
  const capacityPct = Math.min(100, Math.round((totalTicketsSold / totalCapacity) * 100));

  const checkedInCount = attendees.filter(a => a.checkInStatus === 'checked_in').length;
  const totalIssuedAttendees = attendees.length;
  const checkInPct = totalIssuedAttendees > 0 ? Math.round((checkedInCount / totalIssuedAttendees) * 100) : 0;

  // Hourly check-in and sales chart mockup data points
  const hourlyData = [
    { time: '08:00 AM', sales: 12, checkins: 85 },
    { time: '09:00 AM', sales: 28, checkins: 142 },
    { time: '10:00 AM', sales: 45, checkins: 96 },
    { time: '11:00 AM', sales: 30, checkins: 48 },
    { time: '12:00 PM', sales: 22, checkins: 31 },
    { time: '01:00 PM', sales: 18, checkins: 19 },
    { time: '02:00 PM', sales: 15, checkins: 12 },
  ];

  const maxChartVal = 160;

  return (
    <div id="analytics-dashboard-view" className="space-y-6">
      
      {/* Top Welcome & Event Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live Admission & Sales Active
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Event ID: {event.id}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {event.title}
          </h2>
          <p className="text-xs text-slate-500">
            {event.venueName} • {event.date} • Doors Open {event.time}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="quick-ticket-checkout-btn"
            onClick={onOpenCheckout}
            className="flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Zap className="w-4 h-4" />
            <span>Process Ticket Sale</span>
          </button>
          <button
            id="quick-payment-settings-btn"
            onClick={onOpenPaymentSettings}
            className="flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>Stripe Payouts</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Ticket Volume</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 block tracking-tight">
              ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-600 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last cycle</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
            <span>Avg Order Value</span>
            <span className="font-semibold text-slate-600">
              ${totalTicketsSold > 0 ? (grossSales / totalTicketsSold).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Net Organizer Payout */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Organizer Payout</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-indigo-600 block tracking-tight">
              ${netOrganizerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Stripe Connect ACH Direct</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
            <span>Fee Policy</span>
            <span className="font-semibold text-slate-600 capitalize">
              {paymentConfig.feePayer === 'attendee' ? 'Fees Passed to Attendee' : 'Fees Absorbed'}
            </span>
          </div>
        </div>

        {/* Tickets Sold / Capacity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity Occupied</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 block tracking-tight">
              {totalTicketsSold} <span className="text-sm font-semibold text-slate-400">/ {totalCapacity}</span>
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${capacityPct}%` }} 
                />
              </div>
              <span className="text-xs font-bold text-blue-600">{capacityPct}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
            <span>Available Seats</span>
            <span className="font-semibold text-slate-600">{totalCapacity - totalTicketsSold} remaining</span>
          </div>
        </div>

        {/* Checked-In Attendance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Check-In Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 block tracking-tight">
              {checkedInCount} <span className="text-sm font-semibold text-slate-400">/ {totalIssuedAttendees}</span>
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${checkInPct}%` }} 
                />
              </div>
              <span className="text-xs font-bold text-emerald-600">{checkInPct}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
            <span>Door Velocity</span>
            <span className="font-semibold text-emerald-600">~28 check-ins / hr</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Hourly Velocity Chart & Ticket Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Hourly Sales & Gate Check-in Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Admission Velocity & Sales Flow</h3>
              <p className="text-xs text-slate-500">Real-time gate ingress vs ticket checkout activity</p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 font-medium">Gate Admissions</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                <span className="text-slate-600 font-medium">Ticket Sales</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Canvas / Visualizer */}
          <div className="pt-6">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-2">
              {hourlyData.map((d, idx) => {
                const checkinHeight = (d.checkins / maxChartVal) * 100;
                const salesHeight = (d.sales / maxChartVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap shadow-lg">
                      <span className="block font-bold">{d.time}</span>
                      <span>Admissions: {d.checkins} | Sales: {d.sales}</span>
                    </div>

                    {/* Dual Bars */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Checkins Bar */}
                      <div 
                        className="w-1/2 max-w-5 rounded-t-md bg-emerald-500 group-hover:bg-emerald-600 transition-all"
                        style={{ height: `${checkinHeight}%` }}
                      />
                      {/* Sales Bar */}
                      <div 
                        className="w-1/2 max-w-5 rounded-t-md bg-indigo-500 group-hover:bg-indigo-600 transition-all"
                        style={{ height: `${salesHeight}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-400 mt-2 font-mono truncate w-full text-center">
                      {d.time.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3">
              <span>Peak Gate Flow: 09:00 AM (142 attendees scanned)</span>
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => onNavigateTab('scanner')}>
                Open Scanner Terminal →
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Ticket Tier Allocation Breakdown */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ticket Tier Breakdown</h3>
              <p className="text-xs text-slate-500">Inventory allocation and revenue share</p>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              {tiers.length} Tiers
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {tiers.map((tier) => {
              const pct = Math.round((tier.soldQuantity / tier.totalQuantity) * 100);
              const tierRevenue = tier.soldQuantity * tier.price;
              const isSoldOut = tier.soldQuantity >= tier.totalQuantity;

              return (
                <div key={tier.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: tier.color }} 
                        />
                        <span className="font-bold text-xs text-slate-900">{tier.name}</span>
                        {isSoldOut && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-700">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ${tier.price} per ticket • {tier.soldQuantity} of {tier.totalQuantity} sold
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      ${tierRevenue.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: tier.color 
                      }} 
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{pct}% Allocated</span>
                    <span>{tier.totalQuantity - tier.soldQuantity} tickets remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Transactions & Live Sales Stream */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Real-Time Transactions & Gateway Orders</h3>
            <p className="text-xs text-slate-500">Secure Stripe Connect payment intents and ticket fulfillment</p>
          </div>
          <button
            id="view-all-attendees-btn"
            onClick={() => onNavigateTab('attendees')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Manage All Attendees ({attendees.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Order / Intent ID</th>
                <th className="pb-3 pr-4">Attendee</th>
                <th className="pb-3 pr-4">Ticket Tier</th>
                <th className="pb-3 pr-4">Payment Method</th>
                <th className="pb-3 pr-4 text-right">Amount</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 pr-4 font-mono font-semibold text-indigo-600">
                    {tx.id}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-bold text-slate-900 block">{tx.attendeeName}</span>
                    <span className="text-[11px] text-slate-400">{tx.attendeeEmail}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-slate-700">{tx.tierName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Qty: {tx.quantity}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tx.paymentMethod.brand} •••• {tx.paymentMethod.last4}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-extrabold text-slate-900">
                    ${tx.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid ✓
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                    {tx.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
