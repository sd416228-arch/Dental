import React, { useState } from 'react';
import { CLINIC_LOCATIONS, ClinicLocation } from '../data/clinicData';
import { MapPin, Phone, Clock, Mail, ExternalLink, Navigation } from 'lucide-react';

export const ClinicsSection: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation>(CLINIC_LOCATIONS[0]);

  return (
    <section id="clinics" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        <div className="lg:col-span-5">
          <span className="block text-slate-400 font-medium text-2xl sm:text-3xl tracking-tight">
            Our Dental
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinics Across Nepal
          </h2>
        </div>
        <div className="lg:col-span-7">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Conveniently located in prime medical and city centers in Kathmandu, Lalitpur, Pokhara, and Chitwan. Each Denta Care clinic features
            modern sterilization suites, comfortable patient lounges, and on-site 3D diagnostic facilities.
          </p>
        </div>
      </div>

      {/* Clinic Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none" role="tablist">
        {CLINIC_LOCATIONS.map((clinic) => (
          <button
            key={clinic.id}
            onClick={() => setSelectedClinic(clinic)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedClinic.id === clinic.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{clinic.city}</span>
            {clinic.isMainBranch && (
              <span className="text-[10px] bg-sky-700 text-white px-1.5 py-0.5 rounded-full font-medium">
                HQ
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Clinic Details & Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3">
              {selectedClinic.city} Branch
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              {selectedClinic.name}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Full dental care services including emergencies, general hygiene, orthodontics, and restorative surgery.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Address</span>
                  <span className="text-slate-600">
                    {selectedClinic.address}, {selectedClinic.city} {selectedClinic.postalCode}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Direct Telephone</span>
                  <a
                    href={`tel:${selectedClinic.phone}`}
                    className="text-sky-600 hover:text-sky-800 font-semibold"
                  >
                    {selectedClinic.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Opening Hours</span>
                  <span className="text-slate-600">{selectedClinic.hours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Email Inquiries</span>
                  <a
                    href={`mailto:${selectedClinic.email}`}
                    className="text-sky-600 hover:text-sky-800"
                  >
                    {selectedClinic.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <a
              href={selectedClinic.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-7 h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-200 relative">
          <iframe
            title={`Map of ${selectedClinic.name}`}
            src={selectedClinic.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};
