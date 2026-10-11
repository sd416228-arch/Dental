import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Phone } from 'lucide-react';
import { CLINIC_CONFIG } from '../data/clinicData';

interface NavbarProps {
  onOpenBooking: (serviceId?: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'HOME', href: '#home', id: 'home' },
    { label: 'ABOUT', href: '#about', id: 'about' },
    { label: 'OUR TREATMENTS', href: '#treatments', id: 'treatments' },
    { label: 'OUR CLINICS', href: '#clinics', id: 'clinics' },
    { label: 'CONTACT US', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-sky-100/60'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a
            href="#home"
            className="flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500 rounded-lg py-1 px-1"
            aria-label="Denta Care Homepage"
          >
            <span className="font-extrabold text-2xl tracking-tight text-sky-500">
              DENTA
            </span>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              CARE
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 lg:gap-9"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-xs lg:text-[13px] font-bold tracking-wider transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#f2542d]'
                      : 'text-slate-700 hover:text-[#f2542d]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-bold text-xs lg:text-sm tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Book an Appointment"
            >
              <span>BOOK APPOINTMENT</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="px-3 py-1.5 rounded-full bg-[#f2542d] text-white text-[11px] font-bold tracking-wide flex items-center gap-1 shadow-xs"
              aria-label="Book appointment quick mobile action"
            >
              <span>BOOK</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-sky-600 hover:bg-sky-50 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-sky-100 bg-white shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-left py-2 px-3 rounded-lg text-sm font-bold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-[#f2542d]'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#f2542d] text-white font-bold text-sm tracking-wide shadow-md"
              >
                <span>BOOK APPOINTMENT</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href={`tel:${CLINIC_CONFIG.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-sky-300 text-sky-700 font-semibold text-xs bg-sky-50/50"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Clinic: {CLINIC_CONFIG.phoneFormatted}</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
