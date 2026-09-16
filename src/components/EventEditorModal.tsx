import React, { useState } from 'react';
import { EventItem, TicketTier } from '../types';
import { X, Calendar, MapPin, Tag, Users, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface EventEditorModalProps {
  event: EventItem;
  tiers: TicketTier[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: EventItem, updatedTiers: TicketTier[]) => void;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  event,
  tiers,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(event.title);
  const [category, setCategory] = useState(event.category);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [venueName, setVenueName] = useState(event.venueName);
  const [address, setAddress] = useState(event.address);
  const [capacity, setCapacity] = useState(event.capacity);
  const [description, setDescription] = useState(event.description);
  const [currentTiers, setCurrentTiers] = useState<TicketTier[]>([...tiers]);

  if (!isOpen) return null;

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      eventId: event.id,
      name: 'Special Access Tier',
      description: 'Exclusive tier admission with event benefits',
      price: 249,
      currency: 'USD',
      totalQuantity: 150,
      soldQuantity: 0,
      perks: ['Priority Seating', 'Event Merchandise Pack'],
      color: '#06b6d4',
      salesEnd: '2026-11-01'
    };
    setCurrentTiers([...currentTiers, newTier]);
  };

  const handleUpdateTier = (index: number, field: keyof TicketTier, value: any) => {
    const next = [...currentTiers];
    next[index] = { ...next[index], [field]: value };
    setCurrentTiers(next);
  };

  const handleDeleteTier = (index: number) => {
    if (currentTiers.length <= 1) return;
    setCurrentTiers(currentTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEvent: EventItem = {
      ...event,
      title,
      category,
      date,
      time,
      venueName,
      address,
      capacity,
      description
    };
    onSave(updatedEvent, currentTiers);
    onClose();
  };

  return (
    <div id="event-editor-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div id="event-editor-modal-card" className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-base font-bold">Event & Ticket Tiers Configuration</h2>
            <p className="text-xs text-slate-400">Configure event schedule, venue capacity, and ticketing tier pricing</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* General Details */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Event Details & Venue
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doors Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Capacity</label>
                <input
                  type="number"
                  min={10}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Summary</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                2. Ticket Tiers & Pricing ({currentTiers.length})
              </span>
              <button
                type="button"
                onClick={handleAddTier}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentTiers.map((tier, idx) => (
                <div key={tier.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Tier Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Price ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={tier.price}
                        onChange={(e) => handleUpdateTier(idx, 'price', Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Allocation</label>
                      <input
                        type="number"
                        min={tier.soldQuantity}
                        value={tier.totalQuantity}
                        onChange={(e) => handleUpdateTier(idx, 'totalQuantity', Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(idx)}
                        disabled={currentTiers.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              Save Event Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
