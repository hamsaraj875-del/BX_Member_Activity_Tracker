import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Flame,
  Award,
  Search,
  Camera,
  Download,
  Maximize2,
  RefreshCw,
  Clock,
  MapPin,
  Check,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { DepartmentBadge, RoleBadge } from '../components/common/Badge';

export const Attendance = () => {
  const { user, profile, isStaff } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(isStaff ? 'scanner' : 'my-attendance');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Member Personal Analytics
  const [memberStats, setMemberStats] = useState(null);

  // QR Modals
  const [isProjectQRModalOpen, setIsProjectQRModalOpen] = useState(false);
  const [projectingEvent, setProjectingEvent] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [marking, setMarking] = useState(false);

  // Manual Roster Marking State
  const [rosterMap, setRosterMap] = useState({});
  const [savingRoster, setSavingRoster] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data?.success) {
        setEvents(res.data.data);
        if (res.data.data.length > 0 && !selectedEventId) {
          setSelectedEventId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      showToast('Failed to load club events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await api.get(`/events/${eventId}`);
      if (res.data?.success) {
        setSelectedEvent(res.data.data);
        setAttendees(res.data.data.attendees || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMemberAttendance = async () => {
    if (!profile?._id) return;
    try {
      const res = await api.get(`/attendance/member/${profile._id}`);
      if (res.data?.success) {
        setMemberStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (profile?._id) {
      fetchMemberAttendance();
    }
  }, [profile?._id]);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventDetails(selectedEventId);
    }
  }, [selectedEventId]);

  // Setup HTML5 QR Scanner
  useEffect(() => {
    let scanner = null;
    if (isScanModalOpen) {
      setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner('qr-reader-container', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          });

          scanner.render(
            (decodedText) => {
              handleMarkQR(decodedText);
              scanner.clear();
              setIsScanModalOpen(false);
            },
            (error) => {
              // ignore frame read errors
            }
          );
        } catch (e) {
          console.warn('QR Camera initialization note:', e.message);
        }
      }, 300);
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [isScanModalOpen]);

  const handleMarkQR = async (tokenOrPayload) => {
    try {
      setMarking(true);
      const res = await api.post('/attendance/mark-qr', {
        token: tokenOrPayload,
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Attendance Marked Successfully! 🎉', 'success');
        fetchMemberAttendance();
        if (selectedEventId) fetchEventDetails(selectedEventId);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.alreadyMarked) {
        showToast(data.message || 'Attendance Already Recorded for this event.', 'warning');
      } else {
        showToast(data?.message || 'Invalid or expired QR Code.', 'error');
      }
    } finally {
      setMarking(false);
      setIsScanModalOpen(false);
      setManualToken('');
    }
  };

  const handleManualPunch = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleMarkQR(manualToken.trim());
  };

  const handleSaveManualRoster = async () => {
    if (!selectedEventId) return;
    try {
      setSavingRoster(true);
      const records = Object.entries(rosterMap).map(([memberId, status]) => ({
        memberId,
        status,
      }));

      if (records.length === 0) {
        showToast('No changes made to roster.', 'info');
        return;
      }

      const res = await api.post('/attendance/mark-manual', {
        eventId: selectedEventId,
        records,
      });

      if (res.data?.success) {
        showToast('Roster attendance saved successfully!', 'success');
        fetchEventDetails(selectedEventId);
        setRosterMap({});
      }
    } catch (err) {
      showToast('Failed to save roster attendance.', 'error');
    } finally {
      setSavingRoster(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-indigo-400" />
            <span>Attendance & QR System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Scan event QR codes, maintain attendance streaks & audit club event participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Staff vs Member view */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('my-attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my-attendance'
              ? 'bg-indigo-600 text-white shadow-md glow-indigo'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          My Attendance & Streaks
        </button>

        {isStaff && (
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md glow-indigo'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Event Attendance Roster & Projector QR
          </button>
        )}
      </div>

      {/* Member Personal Attendance View */}
      {activeTab === 'my-attendance' && (
        <div className="space-y-6">
          {memberStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                title="Events Attended"
                value={memberStats.eventsAttended}
                subtitle={`Out of ${memberStats.totalEvents} club events`}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Attendance Rate"
                value={`${memberStats.attendancePercentage}%`}
                subtitle="Eligibility threshold: 75%"
                icon={Award}
                color="indigo"
              />
              <StatCard
                title="Current Streak"
                value={`${memberStats.streak} Events`}
                subtitle="Consecutive attendance"
                icon={Flame}
                color="amber"
              />
              <StatCard
                title="Events Missed"
                value={memberStats.eventsMissed}
                subtitle="Absent or unrecorded"
                icon={AlertCircle}
                color="rose"
              />
            </div>
          )}

          {/* Member Attendance History Card */}
          <div className="rounded-2xl glass-card border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">My Attendance Log</h3>
              {memberStats?.lastAttendedEvent && (
                <span className="text-xs text-indigo-400 font-medium">
                  Last Attended: {memberStats.lastAttendedEvent.title} (
                  {new Date(memberStats.lastAttendedEvent.date).toLocaleDateString()})
                </span>
              )}
            </div>

            <div className="space-y-3">
              {memberStats?.history?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No attendance records logged yet. Scan a QR code at your next BX club meeting!
                </p>
              ) : (
                memberStats?.history?.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-dark-950/60 border border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${
                        item.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.event?.title || 'BX Event'}</h4>
                        <p className="text-[11px] text-slate-400">
                          {new Date(item.markedAt).toLocaleDateString()} • {item.event?.location || 'BX Lab'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'present'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        via {item.method}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Event Roster & Projector View */}
      {activeTab === 'scanner' && isStaff && (
        <div className="space-y-6">
          {/* Event Selector & QR Projector Trigger */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Club Event to Audit or Project QR:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full max-w-md px-3 py-2 rounded-xl bg-dark-950/80 border border-slate-700 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()}) - {ev.attendeesCount} Present
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setProjectingEvent(selectedEvent);
                    setIsProjectQRModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-all shadow-md"
                >
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                  <span>Project Fullscreen QR</span>
                </button>

                <button
                  onClick={handleSaveManualRoster}
                  disabled={savingRoster}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingRoster ? 'Saving...' : 'Save Manual Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Event Details and Attendees Table */}
          {selectedEvent && (
            <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedEvent.startTime} - {selectedEvent.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedEvent.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                    {attendees.filter(a => a.status === 'present').length} Marked Present
                  </span>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase tracking-wider text-slate-400 bg-dark-950/80 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Member</th>
                      <th className="py-3 px-4 font-semibold">Dept & Year</th>
                      <th className="py-3 px-4 font-semibold">Marked Time</th>
                      <th className="py-3 px-4 font-semibold">Method</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {attendees.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">
                          <Link to={`/members/${a.member?._id}`} className="hover:text-indigo-400">
                            {a.member?.user?.name || 'BX Member'}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <DepartmentBadge department={a.member?.department || 'CSE'} />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(a.markedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 uppercase font-mono text-slate-500">
                          {a.method}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Fullscreen QR Code Modal */}
      <Modal
        isOpen={isProjectQRModalOpen}
        onClose={() => setIsProjectQRModalOpen(false)}
        title="Project Event QR Code"
        maxWidth="max-w-md"
      >
        {projectingEvent && (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <h4 className="text-lg font-bold text-white">{projectingEvent.title}</h4>
            <p className="text-xs text-slate-400">
              Members can scan this code with their phone camera to automatically record attendance.
            </p>

            <div className="p-4 bg-white rounded-3xl shadow-2xl glow-indigo border-4 border-indigo-600">
              {projectingEvent.qrCodeDataUrl ? (
                <img
                  src={projectingEvent.qrCodeDataUrl}
                  alt="Event QR Code"
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-dark-900 font-mono">
                  Loading QR Code...
                </div>
              )}
            </div>

            <div className="p-3 bg-dark-950/80 rounded-xl border border-slate-800 w-full text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Manual Entry Token</span>
              <code className="text-xs font-mono font-bold text-cyan-400 selection:bg-cyan-900">{projectingEvent.qrCodeToken}</code>
            </div>
          </div>
        )}
      </Modal>

      {/* Scan / Punch Attendance Modal */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Record Attendance"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Point your camera at the projected QR code or enter the event attendance token manually.
          </p>

          <div id="qr-reader-container" className="rounded-2xl overflow-hidden border border-slate-800 bg-dark-950/60 min-h-[220px]" />

          <div className="pt-3 border-t border-slate-800">
            <form onSubmit={handleManualPunch} className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Enter Event Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste QR token string..."
                  className="flex-1 px-3 py-2 rounded-xl bg-dark-950/80 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={marking || !manualToken.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
                >
                  {marking ? 'Verifying...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};
