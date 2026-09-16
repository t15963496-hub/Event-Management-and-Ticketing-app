import React, { useState, useRef, useEffect } from 'react';
import { Attendee, CheckInLog } from '../types';
import { playSuccessBeep, playDuplicateWarning } from '../utils/audio';
import { 
  ScanLine, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Search, 
  Clock, 
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';

interface CheckInScannerProps {
  attendees: Attendee[];
  checkInLogs: CheckInLog[];
  onCheckIn: (attendeeId: string, gate: string) => void;
  onUndoCheckIn: (attendeeId: string) => void;
}

export const CheckInScanner: React.FC<CheckInScannerProps> = ({
  attendees,
  checkInLogs,
  onCheckIn,
  onUndoCheckIn
}) => {
  const [ticketInput, setTicketInput] = useState('');
  const [selectedGate, setSelectedGate] = useState('Gate A - FastTrack VIP');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'success' | 'duplicate' | 'invalid';
    attendee?: Attendee;
    message: string;
    timestamp: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // Try real webcam feed if available
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraPermissionError(false);
        })
        .catch(() => {
          setCameraPermissionError(true);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive]);

  const processScan = (rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) return;

    // Search attendee by ticketId or QR payload or email
    const match = attendees.find(a => 
      a.ticketId.toUpperCase() === cleanCode ||
      a.qrCodeData.toUpperCase() === cleanCode ||
      cleanCode.includes(a.ticketId.toUpperCase()) ||
      a.email.toUpperCase() === cleanCode
    );

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!match) {
      if (soundEnabled) playDuplicateWarning();
      setLastScanResult({
        status: 'invalid',
        message: `Ticket code "${cleanCode}" is not registered in this event database.`,
        timestamp: nowTime
      });
      return;
    }

    if (match.checkInStatus === 'checked_in') {
      if (soundEnabled) playDuplicateWarning();
      setLastScanResult({
        status: 'duplicate',
        attendee: match,
        message: `ALREADY CHECKED IN at ${match.checkInTime || 'earlier'} (${match.checkInGate || 'Gate A'}). Duplicate entry prohibited.`,
        timestamp: nowTime
      });
      return;
    }

    // Success check in!
    if (soundEnabled) playSuccessBeep();
    onCheckIn(match.id, selectedGate);
    setLastScanResult({
      status: 'success',
      attendee: match,
      message: `Verified & Admitted to ${selectedGate}`,
      timestamp: nowTime
    });
    setTicketInput('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(ticketInput);
  };

  const totalCheckedIn = attendees.filter(a => a.checkInStatus === 'checked_in').length;
  const totalAttendees = attendees.length;
  const checkInRate = totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0;

  return (
    <div id="check-in-scanner-component" className="space-y-6">
      
      {/* Top Banner / Gate Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Door Staff Admission Terminal</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rapid optical ticket scanner with real-time fraud & duplicate prevention
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Gate Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500">Gate:</span>
            <select
              id="gate-selector"
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="Gate A - FastTrack VIP">Gate A - FastTrack VIP</option>
              <option value="Gate B - North Turnstile">Gate B - North Turnstile</option>
              <option value="Gate C - Main Atrium">Gate C - Main Atrium</option>
              <option value="Gate D - Backstage & Staff">Gate D - Backstage & Staff</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            id="toggle-scanner-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs font-semibold transition ${
              soundEnabled 
                ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={soundEnabled ? 'Mute scanner audio' : 'Unmute scanner audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Scanner Layout (Two columns on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Viewport & Manual Input */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Scanner Viewport */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg aspect-4/3 flex items-center justify-center">
            
            {/* Live video feed if available, or high-tech simulated viewfinder */}
            {!cameraPermissionError && cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : null}

            {/* Viewfinder Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/40 via-transparent to-black/60" />

            {/* Target Reticle */}
            <div className="relative z-10 w-64 h-64 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center p-4">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg -mb-1 -mr-1" />

              {/* Sweeping Laser Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-laser" />

              <div className="text-center text-slate-300 select-none">
                <ScanLine className="w-10 h-10 mx-auto text-indigo-400/80 mb-2" />
                <span className="text-xs font-semibold uppercase tracking-wider block">Align QR or Barcode</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Laser auto-focus active</span>
              </div>
            </div>

            {/* Terminal Status bar */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur-xs py-1.5 px-3 rounded-lg border border-slate-700/60">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Station 01 • Optical Auto-Detect</span>
              </div>
              <span className="font-mono text-indigo-300">{selectedGate}</span>
            </div>

          </div>

          {/* Manual Ticket ID or Barcode Entry */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="manual-scan-ticket-input"
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Scan or enter Ticket ID (e.g. TKT-VIP-8492 or attendee email)..."
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
            </div>
            <button
              id="submit-scan-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition shrink-0 flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Validate Pass</span>
            </button>
          </form>

          {/* Instant One-Click Test Scans (Great for testing and demoing live scanning!) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Instant Simulation Test Passes (Click any to test gate scan):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attendees.slice(0, 5).map((att) => (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => processScan(att.ticketId)}
                  className={`p-2 rounded-lg border text-left text-xs transition ${
                    att.checkInStatus === 'checked_in'
                      ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{att.name.split(' ')[0]}</span>
                    <span className={`w-2 h-2 rounded-full ${att.checkInStatus === 'checked_in' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 block truncate">{att.ticketId}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold truncate block mt-0.5">{att.tierName}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => processScan('TKT-FAKE-9999')}
                className="p-2 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-left text-xs transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800">Invalid Pass</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <span className="font-mono text-[10px] text-rose-600 block">TKT-FAKE-9999</span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">Test Fraud Alert</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Scan Feedback & Real-time Gate Stats */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Real-Time Result Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Last Scan Verification
            </span>

            {lastScanResult ? (
              <div className={`p-4 rounded-xl border text-sm transition animate-in fade-in zoom-in-95 ${
                lastScanResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : lastScanResult.status === 'duplicate'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-start space-x-3">
                  {lastScanResult.status === 'success' && (
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {lastScanResult.status === 'duplicate' && (
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  {lastScanResult.status === 'invalid' && (
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm uppercase tracking-wide">
                        {lastScanResult.status === 'success' && 'ADMITTED • VALID TICKET'}
                        {lastScanResult.status === 'duplicate' && 'WARNING • DUPLICATE PASS'}
                        {lastScanResult.status === 'invalid' && 'DENIED • UNRECOGNIZED PASS'}
                      </span>
                      <span className="text-xs opacity-75 font-mono">{lastScanResult.timestamp}</span>
                    </div>

                    {lastScanResult.attendee && (
                      <div className="mt-2 text-xs space-y-1">
                        <div className="font-bold text-base text-slate-900">{lastScanResult.attendee.name}</div>
                        <div className="text-slate-600 flex items-center gap-2">
                          <span className="font-semibold">{lastScanResult.attendee.tierName}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{lastScanResult.attendee.ticketId}</span>
                        </div>
                        {lastScanResult.attendee.notes && (
                          <div className="text-[11px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded-md mt-1 border border-indigo-100">
                            ★ Note: {lastScanResult.attendee.notes}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs mt-2 font-medium">
                      {lastScanResult.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                <ScanLine className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <span className="text-xs font-semibold block">Waiting for scan event...</span>
                <span className="text-[11px] text-slate-400 block mt-1">Point scanner at QR code or use test buttons</span>
              </div>
            )}
          </div>

          {/* Gate Attendance Progress Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gate Check-in Progress</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {checkInRate}% In Venue
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${checkInRate}%` }} 
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Admitted</span>
                <span className="text-base font-extrabold text-emerald-600">{totalCheckedIn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
                <span className="text-base font-extrabold text-amber-600">{totalAttendees - totalCheckedIn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Issued</span>
                <span className="text-base font-extrabold text-slate-800">{totalAttendees}</span>
              </div>
            </div>
          </div>

          {/* Recent Gate Activity Log */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Admissions</span>
              <span className="text-[11px] text-slate-400">{checkInLogs.length} logged today</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {checkInLogs.slice(0, 8).map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{log.attendeeName}</span>
                      <span className="text-[10px] text-slate-400">{log.tierName} • {log.gate}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
