import React, { useState } from 'react';
import { Attendee, TicketTier, EventItem } from '../types';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Download, 
  UserPlus, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

interface AttendeesListProps {
  attendees: Attendee[];
  tiers: TicketTier[];
  event: EventItem;
  onCheckInToggle: (attendeeId: string) => void;
  onViewTicket: (attendee: Attendee) => void;
  onAddAttendee: (attendee: Partial<Attendee>) => void;
}

export const AttendeesList: React.FC<AttendeesListProps> = ({
  attendees,
  tiers,
  event,
  onCheckInToggle,
  onViewTicket,
  onAddAttendee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New attendee form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTierId, setNewTierId] = useState(tiers[0]?.id || '');

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = selectedTierFilter === 'all' || a.tierId === selectedTierFilter;
    const matchesStatus = statusFilter === 'all' || a.checkInStatus === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Name', 'Email', 'Tier', 'Price', 'Status', 'Check In Time', 'Gate'];
    const rows = filteredAttendees.map(a => [
      a.ticketId,
      `"${a.name}"`,
      a.email,
      `"${a.tierName}"`,
      a.pricePaid,
      a.checkInStatus,
      a.checkInTime || 'N/A',
      a.checkInGate || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${event.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const tierObj = tiers.find(t => t.id === newTierId) || tiers[0];
    const ticketId = `TKT-${tierObj.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddAttendee({
      id: `att-${Date.now()}`,
      ticketId,
      eventId: event.id,
      orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: '+1 (555) 000-0000',
      tierId: tierObj.id,
      tierName: tierObj.name,
      purchaseDate: 'Manual Comp Entry',
      pricePaid: 0,
      currency: 'USD',
      checkInStatus: 'not_checked_in',
      qrCodeData: `${ticketId}-${newName.trim().toUpperCase()}`
    });

    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div id="attendees-list-component" className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="attendee-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by attendee name, email, or Ticket ID..."
            className="w-full text-xs pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters and Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier Filter */}
          <select
            id="tier-filter-dropdown"
            value={selectedTierFilter}
            onChange={(e) => setSelectedTierFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Tiers ({tiers.length})</option>
            {tiers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="status-filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'checked_in' | 'not_checked_in')}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="checked_in">Checked In</option>
            <option value="not_checked_in">Not Checked In</option>
          </select>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Add Manual Attendee */}
          <button
            id="open-add-attendee-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-300" />
            <span>Add Guest Pass</span>
          </button>
        </div>

      </div>

      {/* Attendees Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Attendee Name</th>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4 text-center">Admission Status</th>
                <th className="py-3.5 px-4">Gate / Scan Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">{att.name}</span>
                      <span className="text-slate-400 text-[11px] block">{att.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {att.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-semibold px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-800">
                        {att.tierName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {att.checkInStatus === 'checked_in' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Admitted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Not Checked In</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {att.checkInStatus === 'checked_in' ? (
                        <div>
                          <span className="font-semibold text-slate-700 block">{att.checkInGate || 'Gate A'}</span>
                          <span className="text-slate-400 font-mono">{att.checkInTime || 'Admitted'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick Check In Toggle */}
                        <button
                          id={`toggle-checkin-${att.id}`}
                          onClick={() => onCheckInToggle(att.id)}
                          className={`py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            att.checkInStatus === 'checked_in'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {att.checkInStatus === 'checked_in' ? 'Undo Check-In' : 'Admit Now'}
                        </button>

                        {/* View Pass / QR */}
                        <button
                          id={`view-ticket-${att.id}`}
                          onClick={() => onViewTicket(att)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                          title="View Digital QR Pass"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No attendees match your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing the search keywords or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Showing {filteredAttendees.length} of {attendees.length} total attendees</span>
          <span>Admitted: {attendees.filter(a => a.checkInStatus === 'checked_in').length}</span>
        </div>
      </div>

      {/* Add Manual Attendee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Issue Complimentary Guest Pass</h3>
            <p className="text-xs text-slate-500 mb-4">Add a VIP guest, sponsor attendee, or speaker directly to the guest list.</p>
            
            <form onSubmit={handleCreateManualAttendee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attendee Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Maya Patel"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="maya@university.edu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ticket Tier</label>
                <select
                  value={newTierId}
                  onChange={(e) => setNewTierId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500"
                >
                  {tiers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ($0.00 comp pass)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Issue Guest Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
