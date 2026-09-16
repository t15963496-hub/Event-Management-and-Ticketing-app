import React, { useState } from 'react';
import { PaymentGatewayConfig } from '../types';
import { 
  X, 
  CreditCard, 
  Building, 
  ArrowUpRight, 
  Zap, 
  Lock, 
  Check, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface PaymentSettingsModalProps {
  config: PaymentGatewayConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (updated: PaymentGatewayConfig) => void;
}

export const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onUpdateConfig
}) => {
  const [feePayer, setFeePayer] = useState<'attendee' | 'organizer'>(config.feePayer);
  const [instantPayouts, setInstantPayouts] = useState<boolean>(config.instantPayoutsEnabled);
  const [currency, setCurrency] = useState<string>(config.currency);
  const [statementDescriptor, setStatementDescriptor] = useState<string>(config.statementDescriptor);
  const [isSaving, setIsSaving] = useState(false);
  const [payoutTriggered, setPayoutTriggered] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateConfig({
        ...config,
        feePayer,
        instantPayoutsEnabled: instantPayouts,
        currency,
        statementDescriptor: statementDescriptor.toUpperCase().slice(0, 22)
      });
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleTriggerInstantPayout = () => {
    if (config.availableBalance <= 0) return;
    setPayoutTriggered(true);
    setTimeout(() => {
      onUpdateConfig({
        ...config,
        availableBalance: 0,
        pendingBalance: config.pendingBalance
      });
      setTimeout(() => setPayoutTriggered(false), 3000);
    }, 1200);
  };

  return (
    <div id="payment-settings-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div id="payment-settings-modal-card" className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Organizer Payment Gateway & Payouts</h2>
              <span className="text-xs text-slate-400">Stripe Connect Custom Merchant Routing</span>
            </div>
          </div>
          <button
            id="close-payment-settings-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                  Stripe Connect Verified
                </span>
                <span className="text-sm font-semibold block text-emerald-950">
                  {config.accountName}
                </span>
                <span className="text-xs text-emerald-700 font-mono">
                  {config.accountId}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-full">
              Payouts Active
            </span>
          </div>

          {/* Balance Cards & Instant Payout Action */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Available for Payout</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">
                ${config.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <button
                id="instant-payout-trigger-btn"
                onClick={handleTriggerInstantPayout}
                disabled={config.availableBalance <= 0 || payoutTriggered}
                className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition disabled:opacity-50"
              >
                {payoutTriggered ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Initiating Transfer...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Payout Now</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pending Escrow</span>
              <span className="text-2xl font-extrabold text-slate-700 block mt-1">
                ${config.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 block mt-3">
                Rolling 2-day settlement schedule
              </span>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-500" />
                Destination Bank Account
              </span>
              <span className="text-[11px] text-slate-500">Direct Deposit (ACH)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold">{config.bankAccount.bankName}</span>
              <span className="font-mono text-slate-600">•••• •••• {config.bankAccount.last4}</span>
            </div>
          </div>

          {/* Fee Absorption Policy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ticketing Fee Allocation
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setFeePayer('attendee')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  feePayer === 'attendee'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900">Pass Fees to Attendee</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Attendee pays 2.9% + $0.30 fee at checkout. You receive 100% of ticket face value.
                </span>
              </div>
              <div
                onClick={() => setFeePayer('organizer')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  feePayer === 'organizer'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900">Absorb Fees in Price</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Attendee pays exact ticket price. Processing fee is deducted from your gross payout.
                </span>
              </div>
            </div>
          </div>

          {/* Statement Descriptor & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statement Descriptor
              </label>
              <input
                id="statement-descriptor-input"
                type="text"
                maxLength={22}
                value={statementDescriptor}
                onChange={(e) => setStatementDescriptor(e.target.value.toUpperCase())}
                placeholder="PULSENEXT*TICKETS"
                className="w-full text-xs font-mono uppercase px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Appears on attendee credit card bills</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Currency
              </label>
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
              <span className="text-[10px] text-slate-400 block mt-1">Primary banking currency</span>
            </div>
          </div>

          {/* Instant Payout Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Automatic Instant Payouts</span>
              <span className="text-[11px] text-slate-500 block">Transfer funds to debit card within 30 minutes</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="instant-payouts-toggle"
                type="checkbox"
                checked={instantPayouts}
                onChange={(e) => setInstantPayouts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              id="save-payment-settings-btn"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Stripe Gateway Settings...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Organizer Payment Preferences</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
