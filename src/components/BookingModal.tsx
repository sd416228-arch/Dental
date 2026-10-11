import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  MessageSquare,
  CalendarPlus,
  Loader2,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  SERVICES_LIST,
  CLINIC_LOCATIONS,
} from '../data/clinicData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  clinic?: string;
  date?: string;
  time?: string;
  submit?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialService,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState(
    initialService || SERVICES_LIST[0].name
  );
  const [selectedClinic, setSelectedClinic] = useState(
    CLINIC_LOCATIONS[0].city
  );
  
  // Calculate today's date
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  // Booked slots for availability warning
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // UI States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Update initialService when prop changes
  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch booked slots when date or clinic changes
  useEffect(() => {
    if (date) {
      fetch(`/api/appointments/booked-slots?date=${encodeURIComponent(date)}&clinic=${encodeURIComponent(selectedClinic)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.bookedSlots)) {
            setBookedSlots(data.bookedSlots);
          }
        })
        .catch(() => {});
    }
  }, [date, selectedClinic]);

  if (!isOpen) return null;

  const timeSlots = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:30 PM',
    '02:30 PM',
    '03:45 PM',
    '05:00 PM',
    '06:15 PM',
  ];

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Please provide your full name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required for appointment confirmation';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 9841234567 or 01-4412345)';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!date) {
      newErrors.date = 'Please select a preferred appointment date';
    } else {
      const selectedDateObj = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDateObj < today) {
        newErrors.date = 'Appointment date cannot be in the past';
      }
    }

    if (!time) {
      newErrors.time = 'Please pick a preferred time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit appointment request to Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          serviceName: selectedService,
          clinicBranch: selectedClinic,
          preferredDate: date,
          preferredTime: time,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to submit appointment request.' });
        setIsSubmitting(false);
        return;
      }

      setBookingRef(data.appointment.id);
      setIsSuccess(true);
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again or book via WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send request via WhatsApp directly
  const handleWhatsAppBooking = () => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Please enter your name first' }));
      return;
    }

    const message = `Hello Denta Care! 🦷\nI would like to request an appointment:\n\n• Patient Name: ${name}\n• Phone: ${phone || 'Same as WhatsApp'}\n• Treatment: ${selectedService}\n• Clinic Branch: ${selectedClinic}\n• Preferred Date: ${date || 'Earliest Available'}\n• Preferred Time: ${time}\n${notes ? `• Notes: ${notes}\n` : ''}\nPlease let me know your available slots!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    if (!date) return;
    const cleanDate = date.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Denta Care//Appointment Request//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dental Appointment Request - ${selectedService}`,
      `DESCRIPTION:Appointment request for ${name} at Denta Care (${selectedClinic} clinic). Reference: ${bookingRef}. Status: Pending Confirmation.`,
      `LOCATION:Denta Care ${selectedClinic} Clinic`,
      `DTSTART:${cleanDate}T100000Z`,
      `DTEND:${cleanDate}T110000Z`,
      'STATUS:TENTATIVE',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `DentaCare-Appointment-${bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      <div className="relative bg-white rounded-3xl max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS CONFIRMATION STATE */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Request Stored in System
            </span>
            <h2 id="booking-title" className="text-2xl font-black text-slate-900 mt-1">
              Thank You, {name}!
            </h2>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-6 text-left space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Appointment Ref ID:</span>
                <span className="font-mono font-extrabold text-[#f2542d] bg-orange-50 px-2.5 py-0.5 rounded text-sm">
                  {bookingRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Treatment:</span>
                <span className="font-bold text-slate-900">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Clinic:</span>
                <span className="font-bold text-slate-900">Denta Care {selectedClinic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Requested Time:</span>
                <span className="font-bold text-slate-900">{date} at {time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                  PENDING APPROVAL
                </span>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Confirmation Notice:</strong> This appointment request is pending clinic review.
                Our patient coordinator will call or SMS you on <strong>{phone}</strong> during clinic hours
                to confirm your final appointment time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadCalendar}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-sky-600" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={handleResetAndClose}
                className="flex-1 py-3 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM STATE */
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#f2542d]">
                Easy Online Scheduling
              </span>
              <h2 id="booking-title" className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Book Your Appointment
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill in your details below or send a one-tap request via WhatsApp.
              </p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Full Name */}
              <div>
                <label htmlFor="patient-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="patient-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                      errors.name
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:bg-white'
                    }`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone and Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patient-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="patient-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="9841234567"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                        errors.phone
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:bg-white'
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="patient-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="patient-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                        errors.email
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Service & Clinic Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service-select" className="block text-xs font-bold text-slate-700 mb-1">
                    Dental Treatment <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="service-select"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  >
                    {SERVICES_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.priceFrom})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="clinic-select" className="block text-xs font-bold text-slate-700 mb-1">
                    Clinic Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="clinic-select"
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:border-sky-500 focus:bg-white focus:outline-hidden"
                  >
                    {CLINIC_LOCATIONS.map((c) => (
                      <option key={c.id} value={c.city}>
                        {c.city} - {c.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-date" className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="booking-date"
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                      }}
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                        errors.date
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:bg-white'
                      }`}
                      required
                    />
                  </div>
                  {errors.date && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="time-select" className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time Slot <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="time-select"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:border-sky-500 focus:bg-white focus:outline-hidden"
                    >
                      {timeSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <option key={slot} value={slot}>
                            {slot} {isBooked ? '(High Demand)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label htmlFor="booking-notes" className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Notes / Dental Concerns
                </label>
                <textarea
                  id="booking-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive lower molar, interested in sedation, or routine hygiene"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:border-sky-500 focus:bg-white focus:outline-hidden resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Request to Clinic Database...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Appointment Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="shrink mx-4 text-xs font-bold text-slate-400 uppercase">Or</span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                {/* WhatsApp fallback button */}
                <button
                  type="button"
                  onClick={handleWhatsAppBooking}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Opens WhatsApp chat with clinic"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Instantly via WhatsApp ({CLINIC_CONFIG.whatsappFormatted})</span>
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-1">
                Submitting stores an appointment request in our database. A clinic coordinator will confirm your exact slot.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
