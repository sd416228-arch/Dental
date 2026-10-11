import React from 'react';
import { ArrowUp, Phone, Mail, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { CLINIC_CONFIG } from '../data/clinicData';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdminLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Accreditations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-sky-400">
                DENTA
              </span>
              <span className="font-black text-2xl tracking-tight text-white">
                CARE
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Providing modern, compassionate, and pain-free dental care.
              Equipped with 3D digital imaging, certified dentists, and patient-first dentistry.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                NMC Registered
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                NDA Member
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Hospital-Grade Sterilization
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Denta Care
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Our Treatments
                </a>
              </li>
              <li>
                <a href="#clinics" className="hover:text-white transition-colors">
                  Our Clinics
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Treatments List */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Treatments
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Dental Checkups
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Scaling & Cleaning
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Dental Implants
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Braces & Invisalign
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Root Canal Therapy
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Teeth Whitening
                </a>
              </li>
            </ul>
          </div>

          {/* Fast Booking CTA */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Book Appointment
            </h4>
            <p className="text-xs text-slate-400">
              Need to see a dentist? Request a slot online or via WhatsApp.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Book Online Now
            </button>
            <a
              href={`https://wa.me/${CLINIC_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} Denta Care Clinics. All rights reserved.</p>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => onOpenAdminLogin && onOpenAdminLogin()}
              className="text-slate-400 hover:text-sky-400 transition-colors font-medium hover:underline cursor-pointer"
            >
              Clinic Staff Portal
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span>Every Smile Matters</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
