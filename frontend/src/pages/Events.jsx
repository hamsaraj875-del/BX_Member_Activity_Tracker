import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  QrCode,
  Users,
  MapPin,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Download,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const Events = () => {
  const { isStaff, user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  // Create event modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '17:00',
    endTime: '19:00',
    location: 'Tech Hub BX Hall',
    type: 'workshop',
    capacity: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  // QR Modal
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        params: { type: eventTypeFilter },
      });
      if (res.data?.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventTypeFilter]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/events', newEvent);
      if (res.data?.success) {
        showToast('Event created successfully with QR code!', 'success');
        setIsCreateModalOpen(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          startTime: '17:00',
          endTime: '19:00',
          location: 'Tech Hub BX Hall',
          type: 'workshop',
          capacity: 100,
        });
        fetchEvents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data?.success) {
        showToast('Event deleted.', 'info');
        fetchEvents();
      }
    } catch (err) {
      showToast('Failed to delete event.', 'error');
    }
  };

  const getEventTypeBadge = (type) => {
    switch (type) {
      case 'hackathon':
        return <Badge variant="rose">Hackathon</Badge>;
      case 'workshop':
        return <Badge variant="indigo">Workshop</Badge>;
      case 'training':
        return <Badge variant="cyan">Training</Badge>;
      case 'meeting':
        return <Badge variant="purple">Meeting</Badge>;
      case 'contest':
        return <Badge variant="amber">Contest</Badge>;
      default:
        return <Badge variant="slate">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-400" />
            <span>Club Events Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Workshops, hackathons, training sessions, and automated QR attendance passes.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'workshop', 'hackathon', 'training', 'contest', 'meeting'].map((t) => (
          <button
            key={t}
            onClick={() => setEventTypeFilter(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              eventTypeFilter === t
                ? 'bg-indigo-600 text-white shadow-md glow-indigo'
                : 'bg-dark-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="There are currently no club events matching this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isPast = new Date(ev.date) < new Date();
            return (
              <div
                key={ev._id}
                className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {getEventTypeBadge(ev.type)}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isPast ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{ev.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {ev.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 py-3 px-3.5 bg-dark-950/60 rounded-xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ev.attendeesCount} Registered Attendees</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedQR(ev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View QR Pass</span>
                  </button>

                  {isStaff && (
                    <button
                      onClick={() => handleDeleteEvent(ev._id, ev.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create BX Club Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              required
              placeholder="e.g. Dynamic Programming & Trie Structures Workshop"
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              required
              placeholder="Outline topics covered, target prerequisites, and session objectives..."
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Event Category
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="workshop">Workshop</option>
                <option value="hackathon">Hackathon</option>
                <option value="training">Training</option>
                <option value="contest">Contest</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                placeholder="17:00"
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                placeholder="19:30"
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Location / Venue
            </label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="e.g. Auditorium / Lab 3 / Discord"
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo disabled:opacity-50"
            >
              {submitting ? 'Generating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Pass Modal */}
      <Modal
        isOpen={Boolean(selectedQR)}
        onClose={() => setSelectedQR(null)}
        title="Event QR Pass"
        maxWidth="max-w-md"
      >
        {selectedQR && (
          <div className="text-center space-y-4 p-2">
            <h4 className="text-base font-bold text-white">{selectedQR.title}</h4>
            <p className="text-xs text-slate-400">{selectedQR.location} • {new Date(selectedQR.date).toLocaleDateString()}</p>

            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-indigo-600">
              <img
                src={selectedQR.qrCodeDataUrl}
                alt="QR Pass"
                className="w-56 h-56 object-contain"
              />
            </div>

            <div className="p-3 bg-dark-950/80 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Token Code</span>
              <code className="text-xs font-mono font-bold text-cyan-400">{selectedQR.qrCodeToken}</code>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
