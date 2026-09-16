import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { EventItem, TicketTier, Attendee, OrderTransaction } from '../types';
import { playPaymentSuccessSound } from '../utils/audio';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Info
} from 'lucide-react';

interface SecureCheckoutModalProps {
  event: EventItem;
  tiers: TicketTier[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAttendee: Attendee, newTransaction: OrderTransaction, tierId: string) => void;
}

export const SecureCheckoutModal: React.FC<SecureCheckoutModalProps> = ({
  event,
  tiers,
  isOpen,
  onClose,
  onSuccess
}) => {
  const availableTiers = tiers.filter(t => t.soldQuantity < t.totalQuantity);
  const [selectedTierId, setSelectedTierId] = useState<string>(availableTiers[0]?.id || tiers[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  
  // Attendee info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Card details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardZip, setCardZip] = useState('94103');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | '3ds_verification' | 'success'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTicket, setCreatedTicket] = useState<{ attendee: Attendee; transaction: OrderTransaction } | null>(null);

  if (!isOpen) return null;

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0];
  const subtotal = (currentTier?.price || 0) * quantity;
  const processingFee = +(subtotal * 0.029 + 0.30 * quantity).toFixed(2);
  const total = +(subtotal + processingFee).toFixed(2);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted || e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please provide your name and email address for ticket issuance.');
      return;
    }
    setErrorMessage('');
    setIsProcessing(true);

    // Simulate 3D Secure / Stripe Tokenization
    setTimeout(() => {
      // Step to 3DS check briefly
      setStep('3ds_verification');

      setTimeout(() => {
        const ticketSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderSuffix = Math.floor(10000 + Math.random() * 90000);
        const prefix = currentTier.name.includes('VIP') ? 'VIP' : currentTier.name.includes('Early') ? 'EAR' : 'GEN';
        const ticketId = `TKT-${prefix}-${ticketSuffix}`;
        const orderId = `ORD-${orderSuffix}`;
        const attendeeId = `att-${Date.now()}`;
        const transactionId = `tx_${Math.random().toString(36).substring(2, 11)}`;

        const newAttendee: Attendee = {
          id: attendeeId,
          ticketId,
          eventId: event.id,
          orderId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || '+1 (555) 019-2831',
          tierId: currentTier.id,
          tierName: currentTier.name,
          purchaseDate: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          pricePaid: currentTier.price,
          currency: currentTier.currency,
          checkInStatus: 'not_checked_in',
          qrCodeData: `${ticketId}-${name.trim().toUpperCase().replace(/\s+/g, '-')}`
        };

        const newTransaction: OrderTransaction = {
          id: transactionId,
          eventId: event.id,
          attendeeId,
          attendeeName: name.trim(),
          attendeeEmail: email.trim().toLowerCase(),
          tierId: currentTier.id,
          tierName: currentTier.name,
          quantity,
          subtotal,
          fees: processingFee,
          totalAmount: total,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: {
            type: paymentMethod,
            brand: paymentMethod === 'card' ? 'Visa' : paymentMethod === 'apple_pay' ? 'Apple Pay (Mastercard)' : 'Google Pay (Visa)',
            last4: paymentMethod === 'card' ? cardNumber.slice(-4) || '4242' : '9012'
          },
          paymentIntentId: `pi_${Math.random().toString(36).substring(2, 15)}_secret_test`,
          createdAt: 'Just now',
          riskScore: 'low'
        };

        playPaymentSuccessSound();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });

        setIsProcessing(false);
        setCreatedTicket({ attendee: newAttendee, transaction: newTransaction });
        setStep('success');
        onSuccess(newAttendee, newTransaction, currentTier.id);
      }, 1000);
    }, 1200);
  };

  const handleResetAndClose = () => {
    setStep('form');
    setIsProcessing(false);
    setCreatedTicket(null);
    onClose();
  };

  return (
    <div id="secure-checkout-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div id="secure-checkout-modal-card" className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Secure Organizer Ticket Checkout</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="flex items-center text-emerald-400">
                  <Lock className="w-3 h-3 mr-1" /> 256-bit Encrypted
                </span>
                <span>•</span>
                <span>Stripe Connect Direct Payout</span>
              </div>
            </div>
          </div>
          <button
            id="close-secure-checkout-btn"
            onClick={handleResetAndClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Event Context Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="truncate pr-2">
                  <span className="font-bold block text-slate-900 truncate">{event.title}</span>
                  <span className="text-slate-500">{event.date} • {event.venueName}</span>
                </div>
                <span className="shrink-0 text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  Verified Event
                </span>
              </div>

              {/* Ticket Tier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Ticket Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tiers.map((tier) => {
                    const isSoldOut = tier.soldQuantity >= tier.totalQuantity;
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                        className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                          isSoldOut
                            ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-slate-900">{tier.name}</span>
                          <span className="font-extrabold text-sm text-slate-900">${tier.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{tier.description}</p>
                        <div className="flex items-center justify-between mt-2 text-[10px]">
                          <span className={isSoldOut ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                            {isSoldOut ? 'Sold Out' : `${tier.totalQuantity - tier.soldQuantity} remaining`}
                          </span>
                          {isSelected && !isSoldOut && (
                            <span className="text-indigo-600 font-bold flex items-center">
                              Selected ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendee Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Attendee Registration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name *</label>
                    <input
                      id="checkout-attendee-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Vane"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ticket Delivery Email *</label>
                    <input
                      id="checkout-attendee-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan@example.com"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Secure Payment Method
                </label>

                {/* Quick tabs */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Apple Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      paymentMethod === 'google_pay'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Google Pay</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          id="checkout-card-number-input"
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white font-mono focus:outline-hidden focus:border-indigo-500"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="•••"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={cardZip}
                          onChange={(e) => setCardZip(e.target.value)}
                          placeholder="94103"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-center focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <p className="text-xs text-slate-600">
                      You will confirm this ${total} purchase using biometric {paymentMethod === 'apple_pay' ? 'FaceID / TouchID' : 'Google Wallet Authentication'}.
                    </p>
                    <div className="mt-2 inline-flex items-center text-[11px] text-emerald-600 font-semibold">
                      <Lock className="w-3 h-3 mr-1" /> Ready for one-touch authorized tokenization
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{currentTier.name} (x{quantity})</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    Payment Gateway & Service Fee (Stripe 2.9% + $0.30)
                    <Info className="w-3 h-3 text-slate-400" />
                  </span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-1.5">
                  <span>Total Authorized</span>
                  <span className="text-indigo-600 text-base">${total.toFixed(2)} USD</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="confirm-pay-ticket-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Stripe Connect Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${total.toFixed(2)} & Issue Instant Ticket</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
                  <span>Merchant Payout via Stripe Connect ID:</span>
                  <code className="font-mono text-slate-500">{event.organizer.stripeAccountId}</code>
                </span>
              </div>
            </form>
          )}

          {step === '3ds_verification' && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verifying 3D Secure / PSD2 Protocol</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Securely communicating with issuing bank network to tokenize card credentials and clear fraud checks...
              </p>
              <div className="w-36 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {step === 'success' && createdTicket && (
            <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Payment Succeeded • Ticket Generated
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  You're going to {event.title}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirmation receipt and digital pass have been issued.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Attendee</span>
                  <span className="font-bold text-slate-800">{createdTicket.attendee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ticket ID</span>
                  <span className="font-mono font-bold text-indigo-600">{createdTicket.attendee.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order & Intent</span>
                  <span className="font-mono text-slate-600">{createdTicket.attendee.orderId}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total Charged</span>
                  <span className="text-emerald-600 font-extrabold">${createdTicket.transaction.totalAmount} USD</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  id="done-checkout-btn"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
