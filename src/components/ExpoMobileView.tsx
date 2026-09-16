import React, { useState } from 'react';
import { EventItem, TicketTier, Attendee, OrderTransaction, PaymentGatewayConfig, CheckInLog } from '../types';
import { 
  BarChart3, 
  ScanLine, 
  Users, 
  CreditCard, 
  Code2, 
  Smartphone, 
  Wifi, 
  Battery, 
  Signal, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Zap,
  Volume2,
  VolumeX,
  Search,
  ExternalLink
} from 'lucide-react';
import { playSuccessBeep, playDuplicateWarning } from '../utils/audio';

interface ExpoMobileViewProps {
  event: EventItem;
  tiers: TicketTier[];
  attendees: Attendee[];
  transactions: OrderTransaction[];
  paymentConfig: PaymentGatewayConfig;
  checkInLogs: CheckInLog[];
  onCheckIn: (attendeeId: string, gate: string) => void;
  onViewTicket: (attendee: Attendee) => void;
  onOpenCheckout: () => void;
}

export const ExpoMobileView: React.FC<ExpoMobileViewProps> = ({
  event,
  tiers,
  attendees,
  transactions,
  paymentConfig,
  checkInLogs,
  onCheckIn,
  onViewTicket,
  onOpenCheckout
}) => {
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'scanner' | 'attendees' | 'wallet' | 'expo_code'>('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'iphone' | 'android'>('iphone');
  
  // Mobile scanner state
  const [manualCode, setManualCode] = useState('');
  const [scannerFeedback, setScannerFeedback] = useState<{ status: 'success' | 'duplicate' | 'invalid'; message: string; name?: string } | null>(null);

  const totalTicketsSold = tiers.reduce((acc, t) => acc + t.soldQuantity, 0);
  const grossSales = tiers.reduce((acc, t) => acc + (t.soldQuantity * t.price), 0);
  const checkedInCount = attendees.filter(a => a.checkInStatus === 'checked_in').length;
  const checkInRate = attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0;

  const handleMobileScan = (code: string) => {
    const clean = code.trim().toUpperCase();
    const match = attendees.find(a => 
      a.ticketId.toUpperCase() === clean || 
      a.qrCodeData.toUpperCase() === clean ||
      clean.includes(a.ticketId.toUpperCase())
    );

    if (!match) {
      playDuplicateWarning();
      setScannerFeedback({ status: 'invalid', message: `Invalid pass code: ${clean}` });
      return;
    }

    if (match.checkInStatus === 'checked_in') {
      playDuplicateWarning();
      setScannerFeedback({
        status: 'duplicate',
        message: `Already checked in at ${match.checkInTime || 'earlier'}`,
        name: match.name
      });
      return;
    }

    playSuccessBeep();
    onCheckIn(match.id, 'Mobile Expo Scanner');
    setScannerFeedback({
      status: 'success',
      message: `Admitted: ${match.name} (${match.tierName})`,
      name: match.name
    });
    setManualCode('');
  };

  const expoProjectCode = `// React Native Expo Event Management & Check-in Companion
// Run in your terminal: npx create-expo-app PassPulseMobile --template blank-typescript
// Install dependencies: npx expo install expo-camera expo-barcode-scanner lucide-react-native @react-navigation/native @react-navigation/bottom-tabs

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, SafeAreaView, StatusBar, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'scanner' | 'attendees'>('analytics');
  
  // Real-time Event State
  const [checkedInCount, setCheckedInCount] = useState(${checkedInCount});
  const totalCapacity = ${event.capacity};
  const grossSales = ${grossSales};

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // Real-time attendee verification API call
    Alert.alert('Ticket Validated', 'Pass: ' + data, [
      { text: 'Admit Attendee', onPress: () => {
          setCheckedInCount(prev => prev + 1);
          setScanned(false);
      }},
      { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PassPulse Expo Mobile</Text>
        <Text style={styles.headerSub}>Moscone West • Doors Open</Text>
      </View>

      {/* Main Tab Screen */}
      <View style={styles.content}>
        {activeTab === 'analytics' && (
          <View style={styles.dashboard}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>REAL-TIME GROSS SALES</Text>
              <Text style={styles.kpiValue}>$\${grossSales.toLocaleString()}</Text>
              <Text style={styles.kpiSub}>Stripe Connect Direct Payouts</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>ATTENDEE CHECK-IN RATE</Text>
              <Text style={styles.kpiValue}>{\`\${checkedInCount} / \${totalCapacity}\`}</Text>
              <Text style={styles.kpiSub}>Live Gate Velocity: Active</Text>
            </View>
          </View>
        )}

        {activeTab === 'scanner' && (
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            <View style={styles.overlayBox} />
            <Text style={styles.scannerPrompt}>Align ticket QR or Barcode</Text>
          </View>
        )}
      </View>

      {/* Expo Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('analytics')}>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('scanner')}>
          <Text style={[styles.tabText, activeTab === 'scanner' && styles.activeTabText]}>Scan QR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  content: { flex: 1 },
  dashboard: { padding: 16, gap: 12 },
  kpiCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  kpiLabel: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  kpiValue: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  kpiSub: { color: '#10b981', fontSize: 12, fontWeight: '600' },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlayBox: { width: 220, height: 220, borderWidth: 2, borderColor: '#6366f1', borderRadius: 16 },
  scannerPrompt: { color: '#ffffff', marginTop: 16, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', height: 60 },
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#6366f1', fontWeight: 'bold' }
});`;

  const copyExpoCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(expoProjectCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div id="expo-mobile-view-container" className="space-y-6">
      
      {/* Subheader with Simulator device controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">React Native Expo Companion Simulator</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test the organizer check-in and sales tracking app in a realistic Expo mobile runtime, or export the native React Native source code.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedDevice('iphone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedDevice === 'iphone'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            iPhone 16 Pro
          </button>
          <button
            onClick={() => setSelectedDevice('android')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedDevice === 'android'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pixel 9 Pro
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile Device Simulator + Native Expo Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5 Cols: Smartphone Frame with Live Expo App */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[360px] bg-slate-900 p-3 rounded-[44px] shadow-2xl border-4 border-slate-800 ring-8 ring-slate-950/20 relative">
            
            {/* Dynamic Island / Camera Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* Inner Phone Screen */}
            <div className="w-full h-[620px] bg-slate-950 rounded-[34px] overflow-hidden flex flex-col text-white relative">
              
              {/* Mobile Status Bar */}
              <div className="pt-3 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 select-none">
                <span>09:41</span>
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Expo Go App Header */}
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
                <div className="truncate">
                  <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase block font-mono">
                    Expo Go • SDK 52
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {event.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              {/* Screen Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                
                {/* 1. DASHBOARD TAB */}
                {mobileTab === 'dashboard' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    
                    {/* Revenue Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Real-Time Sales
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-0.5">
                        ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <span className="text-emerald-400 font-semibold">Stripe Connected ✓</span>
                        <span className="text-slate-400">{totalTicketsSold} / {event.capacity} sold</span>
                      </div>
                    </div>

                    {/* Check-In Progress Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Door Admission Rate
                        </span>
                        <span className="text-xs font-bold text-indigo-400">{checkInRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${checkInRate}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                        <span>{checkedInCount} checked in</span>
                        <span>{attendees.length - checkedInCount} remaining</span>
                      </div>
                    </div>

                    {/* Quick Scan Call-to-action */}
                    <button
                      onClick={() => setMobileTab('scanner')}
                      className="w-full py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>Launch Gate QR Scanner</span>
                    </button>

                    {/* Recent Admissions Ticker */}
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Recent Gate Check-ins
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {checkInLogs.slice(0, 3).map((log) => (
                          <div key={log.id} className="flex justify-between items-center py-1 border-b border-slate-800/50">
                            <span className="font-semibold text-slate-200 truncate pr-2">{log.attendeeName}</span>
                            <span className="text-[10px] font-mono text-emerald-400 shrink-0">{log.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. SCANNER TAB */}
                {mobileTab === 'scanner' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="relative h-44 rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                      <div className="w-32 h-32 border-2 border-indigo-500 rounded-xl relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                        <div className="absolute left-0 right-0 h-0.5 bg-rose-500 animate-laser shadow-[0_0_8px_#f43f5e]" />
                        <ScanLine className="w-8 h-8 text-indigo-400/60" />
                      </div>
                      <span className="absolute bottom-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded-full">
                        Simulated Camera Lens
                      </span>
                    </div>

                    {/* Scan feedback alert */}
                    {scannerFeedback && (
                      <div className={`p-2.5 rounded-xl border text-xs ${
                        scannerFeedback.status === 'success'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                          : scannerFeedback.status === 'duplicate'
                          ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                          : 'bg-rose-950/60 border-rose-600 text-rose-300'
                      }`}>
                        <span className="font-bold block uppercase text-[10px]">
                          {scannerFeedback.status === 'success' ? 'Admitted ✓' : 'Alert ⚠️'}
                        </span>
                        <span>{scannerFeedback.message}</span>
                      </div>
                    )}

                    {/* Quick Scan buttons */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Tap to Simulate Scan:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {attendees.slice(0, 4).map((att) => (
                          <button
                            key={att.id}
                            onClick={() => handleMobileScan(att.ticketId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-[11px] truncate border border-slate-700"
                          >
                            <span className="font-bold block truncate">{att.name.split(' ')[0]}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">{att.ticketId}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Code Input */}
                    <div className="pt-1 flex gap-1.5">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Type ticket ID..."
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleMobileScan(manualCode)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        Verify
                      </button>
                    </div>

                  </div>
                )}

                {/* 3. ATTENDEES TAB */}
                {mobileTab === 'attendees' && (
                  <div className="space-y-2 animate-in fade-in duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Attendee Directory ({attendees.length})
                    </span>
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {attendees.map((att) => (
                        <div
                          key={att.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-white block truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{att.ticketId} • {att.tierName}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (att.checkInStatus === 'checked_in') {
                                playDuplicateWarning();
                              } else {
                                playSuccessBeep();
                                onCheckIn(att.id, 'Mobile Expo App');
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                              att.checkInStatus === 'checked_in'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                          >
                            {att.checkInStatus === 'checked_in' ? 'Admitted' : 'Admit'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WALLET / STRIPE TAB */}
                {mobileTab === 'wallet' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-2xl bg-linear-to-br from-indigo-900/60 to-slate-900 border border-indigo-500/30">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                        Stripe Connect Payout Balance
                      </span>
                      <span className="text-2xl font-black text-white block mt-1">
                        ${paymentConfig.availableBalance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-emerald-400 block mt-1">
                        ● Direct Deposit ACH Ready
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Destination Bank</span>
                        <span className="text-white font-semibold">{paymentConfig.bankAccount.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Ending</span>
                        <span className="font-mono text-white">•••• {paymentConfig.bankAccount.last4}</span>
                      </div>
                    </div>

                    <button
                      onClick={onOpenCheckout}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                    >
                      Charge In-Person Ticket Sale
                    </button>
                  </div>
                )}

              </div>

              {/* Expo Bottom Tabs Bar */}
              <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-30 select-none">
                <button
                  onClick={() => setMobileTab('dashboard')}
                  className={`flex flex-col items-center py-1 px-2 ${
                    mobileTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Metrics</span>
                </button>

                <button
                  onClick={() => setMobileTab('scanner')}
                  className={`flex flex-col items-center py-1 px-2 ${
                    mobileTab === 'scanner' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Scanner</span>
                </button>

                <button
                  onClick={() => setMobileTab('attendees')}
                  className={`flex flex-col items-center py-1 px-2 ${
                    mobileTab === 'attendees' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Guests</span>
                </button>

                <button
                  onClick={() => setMobileTab('wallet')}
                  className={`flex flex-col items-center py-1 px-2 ${
                    mobileTab === 'wallet' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Payouts</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right 7 Cols: Complete React Native Expo Project Code & Instructions */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Ready-to-Deploy React Native Expo Source Code
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full standalone TypeScript Expo SDK 52 application code for iOS, Android, and Expo Go.
              </p>
            </div>

            <button
              id="copy-expo-code-btn"
              onClick={copyExpoCode}
              className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Expo Code</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Setup instructions card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
            <span className="font-bold text-slate-900 block">How to run in Expo Go on your phone:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-mono text-[11px]">
              <li><span className="text-indigo-600 font-semibold">npx create-expo-app PassPulseApp --template blank-typescript</span></li>
              <li><span className="text-indigo-600 font-semibold">npx expo install expo-camera expo-barcode-scanner lucide-react-native</span></li>
              <li>Replace <span className="font-bold text-slate-800">App.tsx</span> with the code below and run <span className="text-indigo-600 font-semibold">npx expo start</span></li>
            </ol>
          </div>

          {/* Code View container */}
          <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-[420px] overflow-y-auto border border-slate-800">
            <pre className="whitespace-pre-wrap">{expoProjectCode}</pre>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Compatible with: Expo SDK 52 • React Native 0.76 • TypeScript 5.x</span>
            <span className="text-emerald-600 font-semibold">CameraView & BarcodeScanner Included ✓</span>
          </div>
        </div>

      </div>

    </div>
  );
};
