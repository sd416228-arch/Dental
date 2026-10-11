import React from 'react';
import { TESTIMONIALS } from '../data/clinicData';
import { Star, CheckCircle, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 bg-[#f8fcfe] rounded-[36px] my-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
          <span className="font-extrabold text-sm text-slate-800 ml-2">4.9 / 5.0 Rating</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          What Our Patients Say
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Real feedback from patients who entrusted their smiles to our dental clinics.
        </p>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-sky-200" />
              </div>

              <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                "{review.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  {review.author}
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />
                </h4>
                <span className="text-[11px] text-slate-500">
                  {review.city} • {review.treatment}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {review.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
