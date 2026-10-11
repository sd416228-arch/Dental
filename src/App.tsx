/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { AboutSection } from './components/AboutSection';
import { TreatmentsSection } from './components/TreatmentsSection';
import { ClinicsSection } from './components/ClinicsSection';
import { DentistsSection } from './components/DentistsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Calendar, MessageSquare } from 'lucide-react';
import { CLINIC_CONFIG } from './data/clinicData';

export default function App() {
  const [view, setView] = useState<'public' | 'admin-login' | 'admin-dashboard'>('public');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Public Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingService, setInitialBookingService] = useState<string | undefined>(undefined);
  const [activeSection, setActiveSection] = useState('home');

  // Verify auth session on initial mount
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('dentacare_admin_jwt');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user);
        return data.user;
      } else {
        setAdminUser(null);
        return null;
      }
    } catch {
      setAdminUser(null);
      return null;
    } finally {
      setIsAuthChecking(false);
    }
  };

  // Synchronize with URL paths (/admin/login, /admin/dashboard, /admin, /)
  useEffect(() => {
    const handleLocationChange = async () => {
      const path = window.location.pathname;
      const user = await checkAuthStatus();

      if (path.startsWith('/admin')) {
        if (path === '/admin/login') {
          setView(user ? 'admin-dashboard' : 'admin-login');
        } else {
          // Direct access to /admin/dashboard or /admin/* without auth must redirect to /admin/login
          if (user) {
            setView('admin-dashboard');
          } else {
            setView('admin-login');
            window.history.replaceState(null, '', '/admin/login');
          }
        }
      } else {
        setView('public');
      }
    };

    handleLocationChange();

    const onPopState = () => {
      handleLocationChange();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Track active section on scroll for public page
  useEffect(() => {
    if (view !== 'public') return;

    const handleScroll = () => {
      const sections = ['home', 'about', 'treatments', 'clinics', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  // Navigation Helpers
  const navigateTo = (newView: 'public' | 'admin-login' | 'admin-dashboard', urlPath: string) => {
    setView(newView);
    window.history.pushState(null, '', urlPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (user: any) => {
    setAdminUser(user);
    navigateTo('admin-dashboard', '/admin/dashboard');
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('dentacare_admin_jwt');
    setAdminUser(null);
    navigateTo('admin-login', '/admin/login');
  };

  const handleOpenBooking = (serviceName?: string) => {
    setInitialBookingService(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setInitialBookingService(undefined);
  };

  /* Render Admin Login View */
  if (view === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLoginSuccess}
        onBackToWebsite={() => navigateTo('public', '/')}
      />
    );
  }

  /* Render Protected Admin Dashboard View */
  if (view === 'admin-dashboard') {
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onViewPublicSite={() => navigateTo('public', '/')}
      />
    );
  }

  /* Render Public Dental Clinic Website */
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfe] text-slate-800 antialiased selection:bg-[#f2542d] selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        activeSection={activeSection}
      />

      {/* Main Content Layout */}
      <main className="grow">
        {/* Hero Section matching mockup with 3D tooth splash */}
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* Ticker / Banner Ribbon */}
        <Ticker />

        {/* About Denta Care Section matching mockup with vision carousel & 4 photo grid */}
        <AboutSection />

        {/* Available Treatments Section */}
        <TreatmentsSection
          onSelectServiceForBooking={(serviceName) => handleOpenBooking(serviceName)}
        />

        {/* Our Clinics Section */}
        <ClinicsSection />

        {/* Dentists Specialist Team */}
        <DentistsSection onOpenBooking={() => handleOpenBooking()} />

        {/* Patient Reviews & Ratings */}
        <TestimonialsSection />

        {/* FAQ Accordion */}
        <FaqSection />

        {/* Contact Section & Direct Booking */}
        <ContactSection />
      </main>

      {/* Footer with Staff Portal Link */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdminLogin={() => navigateTo('admin-login', '/admin/login')}
      />

      {/* Interactive Appointment Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBooking}
        initialService={initialBookingService}
      />

      {/* Floating Action Buttons on mobile/desktop */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {/* Floating WhatsApp Quick Action */}
        <a
          href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(
            'Hello Denta Care! I would like to book a dental consultation.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-hidden focus:ring-4 focus:ring-emerald-200"
          title="Chat on WhatsApp"
          aria-label="Direct WhatsApp Chat with Denta Care"
        >
          <MessageSquare className="w-6 h-6" />
        </a>

        {/* Floating Book Appointment Button (Visible on mobile screens) */}
        <button
          onClick={() => handleOpenBooking()}
          className="md:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-extrabold text-xs tracking-wider shadow-xl transition-transform active:scale-95 focus:outline-hidden"
          aria-label="Open appointment booking modal"
        >
          <Calendar className="w-4 h-4" />
          <span>BOOK NOW</span>
        </button>
      </div>
    </div>
  );
}
