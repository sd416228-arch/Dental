import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { CLINIC_CONFIG } from '../data/clinicData';
import { heroToothImg } from '../assets/images';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section id="home" className="pt-3 pb-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Outer rounded Hero Container matching mockup */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] bg-gradient-to-b from-[#c6ebfa] via-[#dcf4fe] to-[#eef9fe] border border-sky-200/50 shadow-xs px-5 sm:px-8 lg:px-14 pt-8 sm:pt-10 pb-12 sm:pb-16 min-h-[580px] lg:min-h-[640px] flex flex-col justify-between">
        
        {/* Giant Watermark Headline across top */}
        <div className="w-full text-center select-none pointer-events-none relative z-0">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[104px] font-black uppercase tracking-tight text-sky-400/55 leading-none transition-all"
            style={{
              fontFamily: "'Oswald', 'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            {CLINIC_CONFIG.tagline}
          </h1>
        </div>

        {/* Hero Main Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 lg:mt-0">
          
          {/* Left Column: Floating Badge, Opening Hours, CTA Button */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-6 max-w-md">
            
            {/* White speech-card badge from mockup */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border border-white/80 transition-transform duration-200 hover:shadow-lg">
              <p className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                {CLINIC_CONFIG.heroBadge}
              </p>
            </div>

            {/* Opening hours text block from mockup */}
            <div className="pl-1">
              <span className="text-slate-600 text-xs sm:text-[13px] font-medium block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600 inline" />
                We're Open
              </span>
              <span className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight block mt-0.5">
                {CLINIC_CONFIG.openingHoursDisplay}
              </span>
              <span className="text-sky-700 text-[11px] font-medium block">
                {CLINIC_CONFIG.daysOpenDisplay} • Same-day emergency slots
              </span>
            </div>

            {/* Book Appointment CTA Button */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-extrabold text-xs sm:text-sm tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Book an appointment online"
            >
              <span>BOOK APPOINTMENT</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Column: 3D Glossy White Tooth with Blue Splash */}
          <div className="lg:col-span-5 flex items-center justify-center relative my-2 lg:my-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] max-w-full flex items-center justify-center">
              {/* Soft decorative glow background */}
              <div className="absolute inset-0 bg-sky-300/30 rounded-full blur-2xl transform scale-90 pointer-events-none" />
              
              <img
                src={heroToothImg}
                alt="3D Molar Tooth with dynamic blue water splash representing clean and healthy dental care"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 hover:scale-105 select-none"
                loading="eager"
              />
            </div>
          </div>

          {/* Right Column: Stats List matching mockup */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-6 lg:pl-6">
            
            {/* Stat 1 */}
            <div className="transition-transform duration-200 hover:translate-x-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#f2542d] tracking-tight">
                {CLINIC_CONFIG.stats.dentistsCount}
              </div>
              <div className="text-slate-800 font-bold text-xs sm:text-sm mt-0.5">
                {CLINIC_CONFIG.stats.dentistsLabel}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="transition-transform duration-200 hover:translate-x-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#f2542d] tracking-tight">
                {CLINIC_CONFIG.stats.clinicsCount}
              </div>
              <div className="text-slate-800 font-bold text-xs sm:text-sm mt-0.5">
                {CLINIC_CONFIG.stats.clinicsLabel}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="transition-transform duration-200 hover:translate-x-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#f2542d] tracking-tight">
                {CLINIC_CONFIG.stats.countriesCount}
              </div>
              <div className="text-slate-800 font-bold text-xs sm:text-sm mt-0.5">
                {CLINIC_CONFIG.stats.countriesLabel}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
