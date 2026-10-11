import React from 'react';

export const Ticker: React.FC = () => {
  const items = [
    'Braces',
    'Denta Care',
    'Dentist',
    'Dentures',
    'Implants',
    'Whitening',
    'Invisalign',
    'Root Canal',
    'Pediatric Care',
  ];

  return (
    <div
      className="w-full bg-[#c6ebfa] border-y border-sky-200/80 py-4 sm:py-5 overflow-hidden select-none"
      role="region"
      aria-label="Dental Services Highlight"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Repeated twice for infinite loop */}
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center mx-4 sm:mx-8">
            <span
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {item}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 ml-6 sm:ml-10">
              +
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
