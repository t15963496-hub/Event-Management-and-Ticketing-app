import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Attendee, EventItem, TicketTier } from '../types';
import { X, Download, Share2, Calendar, MapPin, CheckCircle2, ShieldCheck, QrCode as QrIcon } from 'lucide-react';

interface DigitalTicketModalProps {
  attendee: Attendee;
  event: EventItem;
  tier?: TicketTier;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  attendee,
  event,
  tier,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        attendee.ticketId || attendee.qrCodeData,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [attendee]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/ticket/${attendee.ticketId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="digital-ticket-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div id="digital-ticket-modal-card" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">Verified Event Pass</span>
          </div>
          <button
            id="close-digital-ticket-modal-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body styled like a modern digital boarding pass */}
        <div className="p-6 bg-linear-to-b from-slate-50 to-white">
          {/* Event Header */}
          <div className="mb-4">
            <span className="inline-block text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              {event.category}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
              {event.title}
            </h3>
          </div>

          {/* Key Details */}
          <div className="space-y-2 mb-6 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{event.venueName}, {event.address}</span>
            </div>
          </div>

          {/* Tear-off Dashed Line with Cutouts */}
          <div className="relative -mx-6 my-6">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/70" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900/70" />
            <div className="border-b-2 border-dashed border-slate-300" />
          </div>

          {/* Attendee Info & Tier */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Attendee</span>
              <span className="font-bold text-slate-800 text-sm block">{attendee.name}</span>
              <span className="text-xs text-slate-500 truncate block">{attendee.email}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tier</span>
              <span 
                className="inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-0.5"
                style={{ 
                  backgroundColor: `${tier?.color || '#4f46e5'}15`, 
                  color: tier?.color || '#4f46e5',
                  border: `1px solid ${tier?.color || '#4f46e5'}40`
                }}
              >
                {attendee.tierName}
              </span>
              <span className="text-xs text-slate-400 block mt-1 font-mono">{attendee.ticketId}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-xs mb-6">
            <canvas ref={canvasRef} className="rounded-lg mb-2" />
            <span className="font-mono text-xs font-semibold text-slate-700 tracking-wider">
              {attendee.ticketId}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <QrIcon className="w-3 h-3 text-slate-400" />
              Scan at door for instant validation
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-100 rounded-lg text-slate-700 mb-6">
            <div className="flex items-center space-x-1.5">
              {attendee.checkInStatus === 'checked_in' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">Checked In ({attendee.checkInTime || 'Active'})</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-medium text-slate-600">Admission Ready (Not yet scanned)</span>
                </>
              )}
            </div>
            <span className="font-mono text-[11px] text-slate-500 font-semibold">{attendee.orderId}</span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="share-ticket-btn"
              onClick={handleShare}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
            </button>
            <button
              id="print-ticket-btn"
              onClick={handlePrint}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
