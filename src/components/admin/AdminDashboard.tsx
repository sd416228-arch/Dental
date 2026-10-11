import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Settings,
  ListOrdered,
  Plus,
  Edit2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Eye,
  CalendarClock,
  Layers,
  ChevronRight,
  Check,
  X,
  Lock,
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: any;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onViewPublicSite,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'services' | 'settings'>('overview');

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Appointments State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Action Modals State
  const [rejectModalAppt, setRejectModalAppt] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Services State
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceModal, setServiceModal] = useState<any>(null); // null = closed, {} = add, or existing item = edit

  // Settings State
  const [clinicSettings, setClinicSettings] = useState<any>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Banner notification for conflicts/errors
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('dentacare_admin_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [onLogout]);

  // Fetch Appointments List
  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery, onLogout]);

  // Fetch Services
  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setServicesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Fetch Clinic Settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setClinicSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchAppointments, fetchServices, fetchSettings]);

  // Open Appointment Details & Audit History Modal
  const handleOpenDetails = async (appt: any) => {
    setSelectedAppointment(appt);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setAppointmentHistory(data.history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Confirm Appointment Action (with transactional conflict check)
  const handleConfirmAppointment = async (id: string) => {
    setBannerNotice(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerNotice({ type: 'error', message: data.error || 'Failed to confirm appointment' });
        return;
      }
      setBannerNotice({ type: 'success', message: data.message });
      fetchAppointments();
      fetchStats();
      if (selectedAppointment && selectedAppointment.id === id) {
        handleOpenDetails({ ...selectedAppointment, status: 'CONFIRMED' });
      }
    } catch (err: any) {
      setBannerNotice({ type: 'error', message: 'Network error while confirming appointment' });
    }
  };

  // Reject Appointment Action
  const handleRejectAppointment = async () => {
    if (!rejectModalAppt) return;
    try {
      const res = await fetch(`/api/admin/appointments/${rejectModalAppt.id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerNotice({ type: 'error', message: data.error });
        return;
      }
      setBannerNotice({ type: 'success', message: data.message });
      setRejectModalAppt(null);
      setRejectionReason('');
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setBannerNotice({ type: 'error', message: 'Network error while rejecting appointment' });
    }
  };

  // Reschedule Appointment Action
  const handleRescheduleAppointment = async () => {
    if (!rescheduleModalAppt || !rescheduleDate || !rescheduleTime) return;
    try {
      const res = await fetch(`/api/admin/appointments/${rescheduleModalAppt.id}/reschedule`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          reason: rescheduleReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerNotice({ type: 'error', message: data.error });
        return;
      }
      setBannerNotice({ type: 'success', message: data.message });
      setRescheduleModalAppt(null);
      setRescheduleDate('');
      setRescheduleReason('');
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setBannerNotice({ type: 'error', message: 'Network error while rescheduling' });
    }
  };

  // Mark Completed Action
  const handleCompleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setBannerNotice({ type: 'success', message: data.message });
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setBannerNotice({ type: 'error', message: 'Failed to complete appointment' });
    }
  };

  // Generate WhatsApp Notification for Patient
  const handleOpenWhatsAppPatient = (appt: any) => {
    let msg = `Hello ${appt.patientName}! 👋\nThis is Denta Care Clinic regarding your appointment (Ref: ${appt.id}).\n`;
    if (appt.status === 'CONFIRMED') {
      msg += `Your appointment for *${appt.serviceName}* on *${appt.confirmedDate || appt.preferredDate}* at *${appt.confirmedTime || appt.preferredTime}* is CONFIRMED.\nLocation: Denta Care ${appt.clinicBranch} Clinic.\nPlease arrive 5 minutes prior to your slot. See you soon!`;
    } else if (appt.status === 'RESCHEDULED') {
      msg += `Your appointment has been RESCHEDULED to *${appt.preferredDate}* at *${appt.preferredTime}*.\nPlease let us know if this time suits you!`;
    } else {
      msg += `Regarding your appointment request for *${appt.serviceName}* on *${appt.preferredDate}* at *${appt.preferredTime}*.\nCould you please confirm if this schedule works for you?`;
    }

    const cleanPhone = (appt.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(clinicSettings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordStatus({ type: 'error', message: data.error });
      } else {
        setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setPasswordStatus({ type: 'error', message: 'Failed to update password.' });
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            PENDING
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <CalendarClock className="w-3.5 h-3.5 text-purple-600" />
            RESCHEDULED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <Check className="w-3.5 h-3.5 text-sky-600" />
            COMPLETED
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Portal Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
                <span className="text-sky-400">DENTA</span>
                <span className="text-white">CARE</span>
              </div>
              <span className="bg-sky-950 text-sky-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-800">
                CLINIC ADMIN
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Appointments</span>
                {stats?.pendingRequests > 0 && (
                  <span className="bg-[#f2542d] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {stats.pendingRequests}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Settings
              </button>
            </nav>

            {/* Admin Profile & Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onViewPublicSite}
                className="hidden sm:inline-flex text-xs text-sky-400 hover:text-sky-300 font-bold px-3 py-1.5 rounded-lg border border-sky-800/60 hover:bg-sky-950 transition-colors cursor-pointer"
              >
                Public Site ↗
              </button>

              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{adminUser?.name || 'Admin'}</span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Log out of admin session"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2 px-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1 px-2 font-bold ${activeTab === 'overview' ? 'text-sky-400' : 'text-slate-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-1 px-2 font-bold relative ${activeTab === 'appointments' ? 'text-sky-400' : 'text-slate-400'}`}
          >
            Appointments
            {stats?.pendingRequests > 0 && (
              <span className="ml-1 bg-[#f2542d] text-white text-[9px] px-1 py-0.2 rounded-full">
                {stats.pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-1 px-2 font-bold ${activeTab === 'services' ? 'text-sky-400' : 'text-slate-400'}`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1 px-2 font-bold ${activeTab === 'settings' ? 'text-sky-400' : 'text-slate-400'}`}
          >
            Settings
          </button>
          <button
            onClick={onViewPublicSite}
            className="py-1 px-2 font-bold text-sky-400"
          >
            Site ↗
          </button>
        </div>
      </header>

      {/* Global Notice Banner */}
      {bannerNotice && (
        <div
          className={`px-4 py-3 text-xs font-semibold flex items-center justify-between transition-all ${
            bannerNotice.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {bannerNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-white hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grow">
        
        {/* =========================================================================
            TAB 1: OVERVIEW DASHBOARD
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header Title & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Clinic Operations Overview
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Real-time database statistics and patient scheduling activity. Local date: {stats?.todayDate || 'Today'}
                </p>
              </div>

              <button
                onClick={() => fetchStats()}
                disabled={statsLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* 4 Summary Cards matching mockup color aesthetics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Today's Appointments */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Today's Schedule
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {statsLoading ? '...' : stats?.todayAppointments ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bookings scheduled for today ({stats?.todayDate})
                </p>
              </div>

              {/* Card 2: Pending Requests */}
              <div
                onClick={() => {
                  setStatusFilter('PENDING');
                  setActiveTab('appointments');
                }}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-white to-amber-50/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Pending Requests
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#f2542d]">
                  {statsLoading ? '...' : stats?.pendingRequests ?? 0}
                </div>
                <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                  <span>Awaiting coordinator approval</span>
                  <ArrowRight className="w-3 h-3 inline" />
                </p>
              </div>

              {/* Card 3: Confirmed Appointments */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Confirmed
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {statsLoading ? '...' : stats?.confirmedAppointments ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Active confirmed patient slots
                </p>
              </div>

              {/* Card 4: Completed Care */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Completed Consultations
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {statsLoading ? '...' : stats?.completedAppointments ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total patient treatments completed
                </p>
              </div>

            </div>

            {/* Recent Appointments Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Recent Appointment Requests
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest bookings submitted by patients through the public website
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Appointments</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {stats?.recentAppointments?.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No appointments registered yet. Public booking submissions will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">ID & Patient</th>
                        <th className="py-3.5 px-6">Service</th>
                        <th className="py-3.5 px-6">Branch</th>
                        <th className="py-3.5 px-6">Date & Slot</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {stats?.recentAppointments?.map((appt: any) => (
                        <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6">
                            <span className="font-mono font-bold text-[#f2542d] block text-[11px]">
                              {appt.id}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {appt.patientName}
                            </span>
                            <span className="text-slate-400 text-[11px]">{appt.phone}</span>
                          </td>
                          <td className="py-3.5 px-6 text-slate-800 font-bold">
                            {appt.serviceName}
                          </td>
                          <td className="py-3.5 px-6 text-slate-600">
                            {appt.clinicBranch}
                          </td>
                          <td className="py-3.5 px-6 text-slate-700">
                            <span className="font-bold block">{appt.preferredDate}</span>
                            <span className="text-slate-400 text-[11px]">{appt.preferredTime}</span>
                          </td>
                          <td className="py-3.5 px-6">
                            {renderStatusBadge(appt.status)}
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-2">
                            {appt.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmAppointment(appt.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleOpenDetails(appt);
                                setActiveTab('appointments');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: APPOINTMENT MANAGEMENT
            ========================================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Appointment Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Review requests, confirm slots, prevent scheduling conflicts, and contact patients.
                </p>
              </div>

              <button
                onClick={() => fetchAppointments()}
                disabled={appointmentsLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${appointmentsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAppointments()}
                  placeholder="Search by Patient Name, Phone, or ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:border-sky-500 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="w-full sm:w-44">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Filter Submit */}
              <button
                onClick={() => fetchAppointments()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Filter
              </button>
            </div>

            {/* Appointments Table / List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {appointmentsLoading ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Loading appointments from database...
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No appointments found matching your filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6">Reference ID</th>
                        <th className="py-4 px-6">Patient Name & Phone</th>
                        <th className="py-4 px-6">Treatment</th>
                        <th className="py-4 px-6">Clinic Branch</th>
                        <th className="py-4 px-6">Appointment Slot</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-mono font-black text-[#f2542d] bg-orange-50 px-2 py-0.5 rounded">
                              {appt.id}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1">
                              {new Date(appt.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <span className="font-black text-slate-900 text-sm block">
                              {appt.patientName}
                            </span>
                            <a
                              href={`tel:${appt.phone}`}
                              className="text-sky-600 hover:underline text-[11px] font-semibold"
                            >
                              {appt.phone}
                            </a>
                            {appt.email && (
                              <span className="block text-slate-400 text-[10px]">
                                {appt.email}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 font-bold text-slate-800">
                            {appt.serviceName}
                          </td>

                          <td className="py-4 px-6 text-slate-600">
                            {appt.clinicBranch}
                          </td>

                          <td className="py-4 px-6">
                            <span className="font-extrabold text-slate-900 block">
                              {appt.preferredDate}
                            </span>
                            <span className="text-slate-500 font-semibold text-[11px]">
                              {appt.preferredTime}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            {renderStatusBadge(appt.status)}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Confirm button */}
                              {appt.status !== 'CONFIRMED' && appt.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleConfirmAppointment(appt.id)}
                                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                  title="Confirm appointment and reserve slot"
                                >
                                  Confirm
                                </button>
                              )}

                              {/* WhatsApp Contact button */}
                              <button
                                onClick={() => handleOpenWhatsAppPatient(appt)}
                                className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                title="Send WhatsApp notification to patient"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Reschedule button */}
                              {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => {
                                    setRescheduleModalAppt(appt);
                                    setRescheduleDate(appt.preferredDate);
                                    setRescheduleTime(appt.preferredTime);
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-[10px] transition-colors cursor-pointer"
                                  title="Reschedule to new date/time"
                                >
                                  Reschedule
                                </button>
                              )}

                              {/* Details button */}
                              <button
                                onClick={() => handleOpenDetails(appt)}
                                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SERVICES MANAGEMENT
            ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Dental Services Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage clinic treatment offerings, pricing, durations, and active status.
                </p>
              </div>

              <button
                onClick={() => setServiceModal({})}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
                    service.isActive
                      ? 'border-slate-200/80 hover:border-sky-300'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {service.category}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          service.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {service.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Duration: {service.duration}</span>
                      <span className="font-extrabold text-[#f2542d]">{service.priceFrom}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setServiceModal(service)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/services/${service.id}`, {
                            method: 'PATCH',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ isActive: !service.isActive }),
                          });
                          fetchServices();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          service.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CLINIC SETTINGS
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Clinic Operational Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure clinic details, local timezone, working hours, and administrator credentials.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clinic settings updated and saved to database successfully!</span>
              </div>
            )}

            {/* General Clinic Settings Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                Clinic Contact & Scheduling Configuration
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      value={clinicSettings.clinic_name || ''}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, clinic_name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Local Timezone
                    </label>
                    <select
                      value={clinicSettings.timezone || 'Asia/Kathmandu'}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, timezone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    >
                      <option value="Asia/Kathmandu">Asia/Kathmandu (Nepal Standard Time GMT+5:45)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST GMT+5:30)</option>
                      <option value="UTC">UTC (Universal Time)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Phone
                    </label>
                    <input
                      type="text"
                      value={clinicSettings.clinic_phone || ''}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, clinic_phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Contact Number
                    </label>
                    <input
                      type="text"
                      value={clinicSettings.clinic_whatsapp || ''}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, clinic_whatsapp: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clinic Email Address
                    </label>
                    <input
                      type="email"
                      value={clinicSettings.clinic_email || ''}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, clinic_email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Operating Hours Display
                    </label>
                    <input
                      type="text"
                      value={clinicSettings.opening_hours || ''}
                      onChange={(e) =>
                        setClinicSettings({ ...clinicSettings, opening_hours: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booking Notice Displayed to Patients
                  </label>
                  <textarea
                    rows={2}
                    value={clinicSettings.booking_notice || ''}
                    onChange={(e) =>
                      setClinicSettings({ ...clinicSettings, booking_notice: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Save Operational Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Change Admin Password Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-600" />
                <span>Change Administrator Password</span>
              </h3>

              {passwordStatus && (
                <div
                  className={`p-4 rounded-xl text-xs mb-4 ${
                    passwordStatus.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-[#f2542d] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL 1: APPOINTMENT DETAILS & STATUS HISTORY AUDIT LOG
          ========================================================================= */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedAppointment(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="font-mono font-bold text-[#f2542d] text-xs">
                  {selectedAppointment.id}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedAppointment.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-500 block text-xs">Contact Phone</span>
                  <a
                    href={`tel:${selectedAppointment.phone}`}
                    className="font-bold text-sky-600 hover:underline"
                  >
                    {selectedAppointment.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Email Address</span>
                  <span className="font-bold text-slate-800">
                    {selectedAppointment.email || 'None provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Treatment</span>
                  <span className="font-bold text-slate-800">
                    {selectedAppointment.serviceName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Clinic Branch</span>
                  <span className="font-bold text-slate-800">
                    {selectedAppointment.clinicBranch}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Date & Time</span>
                  <span className="font-bold text-slate-800">
                    {selectedAppointment.preferredDate} at {selectedAppointment.preferredTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Current Status</span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block text-xs mb-1">
                    Patient Notes / Symptoms:
                  </span>
                  <p className="text-slate-700 text-xs">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Status Audit History Timeline */}
              <div className="pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Status History & Audit Log
                </h4>
                {historyLoading ? (
                  <p className="text-xs text-slate-400">Loading audit log...</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                    {appointmentHistory.map((h, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="font-bold text-slate-900">
                          {h.toStatus} <span className="text-slate-400 font-normal">by {h.changedBy}</span>
                        </div>
                        <div className="text-slate-500">{h.reason}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(h.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleOpenWhatsAppPatient(selectedAppointment)}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Patient</span>
              </button>

              {selectedAppointment.status !== 'CONFIRMED' && (
                <button
                  onClick={() => {
                    handleConfirmAppointment(selectedAppointment.id);
                  }}
                  className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm Slot
                </button>
              )}

              {selectedAppointment.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    handleCompleteAppointment(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                >
                  Mark Completed
                </button>
              )}

              <button
                onClick={() => {
                  setRejectModalAppt(selectedAppointment);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REJECT APPOINTMENT REASON
          ========================================================================= */}
      {rejectModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Reject Appointment Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: {rejectModalAppt.patientName} ({rejectModalAppt.id})
            </p>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Rejection
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Fully booked for this day, emergency clinic closure, or specialist unavailable."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs mb-4 focus:outline-hidden"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModalAppt(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectAppointment}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RESCHEDULE APPOINTMENT
          ========================================================================= */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: {rescheduleModalAppt.patientName} ({rescheduleModalAppt.id})
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Date *
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Time Slot *
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:45 PM">03:45 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:15 PM">06:15 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reschedule Reason
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Patient requested earlier slot / doctor schedule adjusted"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRescheduleModalAppt(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleAppointment}
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Reschedule & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD / EDIT SERVICE
          ========================================================================= */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {serviceModal.id ? 'Edit Dental Service' : 'Add New Dental Service'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const isEdit = Boolean(serviceModal.id);
                const url = isEdit ? `/api/admin/services/${serviceModal.id}` : '/api/admin/services';
                const method = isEdit ? 'PATCH' : 'POST';

                await fetch(url, {
                  method,
                  headers: getAuthHeaders(),
                  body: JSON.stringify(serviceModal),
                });
                setServiceModal(null);
                fetchServices();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceModal.name || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, name: e.target.value })}
                  placeholder="e.g. Porcelain Veneers"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceModal.category || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, category: e.target.value })}
                    placeholder="e.g. Cosmetics"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Starting Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceModal.priceFrom || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, priceFrom: e.target.value })}
                    placeholder="e.g. Rs. 2,500"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={serviceModal.duration || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, duration: e.target.value })}
                    placeholder="e.g. 45 mins"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recommended Frequency
                  </label>
                  <input
                    type="text"
                    value={serviceModal.recommendedFrequency || ''}
                    onChange={(e) =>
                      setServiceModal({ ...serviceModal, recommendedFrequency: e.target.value })
                    }
                    placeholder="e.g. Every 6 months"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={serviceModal.shortDesc || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, shortDesc: e.target.value })}
                  placeholder="One sentence summary for service cards"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-bold text-xs"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
