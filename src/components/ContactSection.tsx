import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CLINIC_CONFIG, CLINIC_LOCATIONS } from '../data/clinicData';

export const ContactSection: React.FC = () => {
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickQuestion, setQuickQuestion] = useState('');
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickPhone) return;
    setQuickSubmitted(true);
    setTimeout(() => {
      setQuickName('');
      setQuickPhone('');
      setQuickQuestion('');
    }, 1500);
  };

  const whatsappInquiryUrl = `https://wa.me/${
    CLINIC_CONFIG.whatsappNumber
  }?text=${encodeURIComponent(
    'Hello Denta Care! I have an inquiry about dental treatments and appointments.'
  )}`;

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        <div className="lg:col-span-5">
          <span className="block text-slate-400 font-medium text-2xl sm:text-3xl tracking-tight">
            Get In
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Touch With Us
          </h2>
        </div>
        <div className="lg:col-span-7">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions about an upcoming treatment, need emergency dental guidance,
            or prefer speaking with our reception team directly? We are here to help.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Phone Card */}
          <a
            href={`tel:${CLINIC_CONFIG.phone}`}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Call Our Reception
              </span>
              <span className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                {CLINIC_CONFIG.phoneFormatted}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Direct phone link (tel:)
              </span>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Chat On WhatsApp
              </span>
              <span className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {CLINIC_CONFIG.whatsappFormatted}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Fast replies within clinic hours
              </span>
            </div>
          </a>

          {/* Email Card */}
          <a
            href={`mailto:${CLINIC_CONFIG.email}`}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Email Inquiries
              </span>
              <span className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                {CLINIC_CONFIG.email}
              </span>
              <span className="text-[11px] text-slate-500 block">
                For patient referrals & detailed inquiries
              </span>
            </div>
          </a>

          {/* Operating Hours Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Clinic Working Hours
              </h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Monday – Friday:</span>
                <span className="font-bold text-slate-900">10:00 AM – 07:00 PM</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Saturday:</span>
                <span className="font-bold text-slate-900">10:00 AM – 07:00 PM</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Sunday:</span>
                <span className="font-bold text-[#f2542d]">Emergency On-Call Only</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Message / Callback Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#f2542d]">
              Direct Inquiry
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
              Request a Quick Callback
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Leave your details below, and our patient coordinator will call you back
              within 30 minutes during opening hours.
            </p>

            {quickSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in zoom-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-extrabold text-base text-slate-900">
                  Callback Request Received!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Our coordinator will reach out to you shortly. Thank you for choosing Denta Care.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="callback-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      id="callback-name"
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="callback-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="callback-phone"
                      type="tel"
                      required
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      placeholder="9841234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="callback-query" className="block text-xs font-bold text-slate-700 mb-1">
                    How Can We Help? (Optional)
                  </label>
                  <textarea
                    id="callback-query"
                    rows={3}
                    value={quickQuestion}
                    onChange={(e) => setQuickQuestion(e.target.value)}
                    placeholder="Tell us what you need help with (e.g. dental implant inquiry, braces pricing, toothache advice)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-100 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-[#f2542d] text-white font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Callback Request</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Main Clinic: {CLINIC_LOCATIONS[0].address}, {CLINIC_LOCATIONS[0].city}</span>
            <a
              href={CLINIC_LOCATIONS[0].googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Open Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
