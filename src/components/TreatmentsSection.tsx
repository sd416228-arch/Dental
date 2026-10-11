import React, { useState } from 'react';
import {
  SERVICES_LIST,
  ServiceItem,
} from '../data/clinicData';
import {
  Stethoscope,
  Sparkles,
  Smile,
  Activity,
  Sun,
  ShieldAlert,
  Zap,
  HeartHandshake,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Tag,
  Info,
  X,
  Check,
} from 'lucide-react';

interface TreatmentsSectionProps {
  onSelectServiceForBooking: (serviceName: string) => void;
}

export const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({
  onSelectServiceForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);

  const categories = ['All', 'Preventative', 'Cosmetics', 'Restorative', 'Alignment', 'Endodontics', 'Children'];

  const filteredServices =
    activeCategory === 'All'
      ? SERVICES_LIST
      : SERVICES_LIST.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Smile':
        return <Smile className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Sun':
        return <Sun className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <section id="treatments" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      {/* Top Split Header matching mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        {/* Left Heading */}
        <div className="lg:col-span-5">
          <span className="block text-slate-400 font-medium text-2xl sm:text-3xl tracking-tight">
            Available
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Treatments
          </h2>
        </div>

        {/* Right Description */}
        <div className="lg:col-span-7">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            At Denta Care, we offer a wide range of treatments, from routine cleanings and
            fillings to advanced procedures like implants and cosmetic dentistry. Our goal is
            to provide personalized care for all your dental needs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none" role="tablist" aria-label="Treatment categories">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  {getServiceIcon(service.iconName)}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {service.category}
                </span>
              </div>

              {/* Title & Short Desc */}
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors mb-2">
                {service.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {service.shortDesc}
              </p>
            </div>

            {/* Price, Duration & Actions */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {service.duration}
                </span>
                <span className="font-extrabold text-sm text-[#f2542d]">
                  From {service.priceFrom}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedServiceModal(service)}
                  className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  aria-label={`View details for ${service.name}`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                <button
                  onClick={() => onSelectServiceForBooking(service.name)}
                  className="w-full py-2.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  aria-label={`Book appointment for ${service.name}`}
                >
                  <span>Book</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedServiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedServiceModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  {getServiceIcon(selectedServiceModal.iconName)}
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-600 block">
                    {selectedServiceModal.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {selectedServiceModal.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                aria-label="Close treatment details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {selectedServiceModal.fullDesc}
            </p>

            <div className="bg-sky-50/60 rounded-2xl p-4 mb-6 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Typical Duration:</span>
                <span className="font-bold text-slate-900">{selectedServiceModal.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Starting Price:</span>
                <span className="font-extrabold text-base text-[#f2542d]">{selectedServiceModal.priceFrom}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Recommended Frequency:</span>
                <span className="font-bold text-slate-900">{selectedServiceModal.recommendedFrequency}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero-pain localized anesthesia or twilight sedation available</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Itemized written quote prior to commencement</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>0% APR payment installment plans available</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="w-1/2 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedServiceModal;
                  setSelectedServiceModal(null);
                  onSelectServiceForBooking(s.name);
                }}
                className="w-1/2 py-3 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Book This</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
