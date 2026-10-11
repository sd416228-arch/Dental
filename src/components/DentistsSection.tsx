import React from 'react';
import { DENTISTS_LIST } from '../data/clinicData';
import { Award, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface DentistsSectionProps {
  onOpenBooking: () => void;
}

export const DentistsSection: React.FC<DentistsSectionProps> = ({ onOpenBooking }) => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        <div className="lg:col-span-5">
          <span className="block text-slate-400 font-medium text-2xl sm:text-3xl tracking-tight">
            Our Expert
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Dental Specialists
          </h2>
        </div>
        <div className="lg:col-span-7">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every dentist at Denta Care is registered with the Nepal Medical Council (NMC) and Nepal Dental Association (NDA),
            holds postgraduate master's degrees in their specialty, and participates in continuous
            international clinical education.
          </p>
        </div>
      </div>

      {/* Dentists Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DENTISTS_LIST.map((dentist) => (
          <div
            key={dentist.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Doctor Photo */}
              <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative">
                <img
                  src={dentist.image}
                  alt={`${dentist.name} - ${dentist.role}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-sky-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    {dentist.gdcNumber}
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-slate-900 mb-0.5">
                  {dentist.name}
                </h3>
                <span className="text-xs font-semibold text-[#f2542d] block mb-2">
                  {dentist.role}
                </span>

                <p className="text-[11px] text-slate-500 font-medium mb-3">
                  {dentist.qualifications}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {dentist.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dentist.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-5 pt-0">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-[#f2542d] text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Appointment</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
