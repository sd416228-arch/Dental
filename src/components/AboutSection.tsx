import React, { useState } from 'react';
import { CLINIC_VISIONS } from '../data/clinicData';
import {
  clinicChairImg,
  patientWomanImg,
  seniorWomanImg,
  modernOperatoryImg,
} from '../assets/images';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [currentVisionIndex, setCurrentVisionIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    title: string;
    description: string;
    image: string;
    tag: string;
  } | null>(null);

  const galleryItems = [
    {
      id: 1,
      image: clinicChairImg,
      alt: 'Luxury dental operatory with panoramic view and digital equipment',
      tag: 'Dental Care',
      tagType: 'horizontal-blue',
      title: 'Ergonomic Treatment Suites',
      description:
        'Designed to minimize patient anxiety with panoramic natural light, whisper-quiet electric handpieces, and ceiling-mounted entertainment screens.',
    },
    {
      id: 2,
      image: patientWomanImg,
      alt: 'Happy female patient smiling in dental chair after treatment',
      tag: 'Dentures',
      tagType: 'vertical-coral-right',
      title: 'Precision Cosmetic & Prosthetic Dentistry',
      description:
        'Custom dental prosthetics, natural-looking dentures, and smile makeovers engineered for maximum comfort and perfect chewing functionality.',
    },
    {
      id: 3,
      image: seniorWomanImg,
      alt: 'Healthy smiling senior patient enjoying life with renewed dental health',
      tag: 'Dental Treatments',
      tagType: 'vertical-coral-left',
      title: 'Lifetime Dental Health for All Generations',
      description:
        'Personalized preventative and restorative dental plans that keep natural teeth strong, functional, and radiant at every stage of life.',
    },
    {
      id: 4,
      image: modernOperatoryImg,
      alt: 'Sterile high-tech treatment operatory with modern mint chairs and dental monitors',
      tag: 'Teeth Alignment',
      tagType: 'horizontal-blue',
      title: 'Advanced 3D Aligners & Orthodontics',
      description:
        'Equipped with iTero 3D digital scanners to simulate tooth movement in real time—eliminating gooey impression trays forever.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Split Header matching mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14">
        {/* Left Heading */}
        <div className="lg:col-span-5">
          <span className="block text-slate-400 font-medium text-2xl sm:text-3xl tracking-tight">
            About
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Denta Care
          </h2>
        </div>

        {/* Right Vision Text & Interactive Dots */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <span className="text-[#f2542d] font-bold text-xs uppercase tracking-widest block mb-2">
              {CLINIC_VISIONS[currentVisionIndex].title}
            </span>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {CLINIC_VISIONS[currentVisionIndex].text}
            </p>
          </div>

          {/* Interactive Pagination Dots matching mockup */}
          <div className="flex items-center gap-2 mt-5" aria-label="Vision Carousel Controls">
            {CLINIC_VISIONS.map((vision, idx) => {
              const isActive = idx === currentVisionIndex;
              return (
                <button
                  key={vision.id}
                  onClick={() => setCurrentVisionIndex(idx)}
                  className={`transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'w-6 h-2.5 bg-[#f2542d] rounded-full'
                      : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400 rounded-full'
                  }`}
                  aria-label={`Go to vision slide ${idx + 1}: ${vision.title}`}
                  aria-pressed={isActive}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 4-Image Collage Grid with Badges matching mockup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Image 1: Top Left */}
        <div
          onClick={() => setSelectedPhoto(galleryItems[0])}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <img
            src={galleryItems[0].image}
            alt={galleryItems[0].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge: "Dental Care" (horizontal light blue pill) */}
          <div className="absolute bottom-4 left-4 z-10">
            <span className="inline-block bg-[#d4f2fc] text-[#0369a1] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
              {galleryItems[0].tag}
            </span>
          </div>
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors" />
        </div>

        {/* Image 2: Top Right */}
        <div
          onClick={() => setSelectedPhoto(galleryItems[1])}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <img
            src={galleryItems[1].image}
            alt={galleryItems[1].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge: "Dentures" (peach/coral vertical tag on right edge) */}
          <div className="absolute top-6 right-3 sm:right-4 z-10">
            <span
              className="inline-block bg-[#ffeedb] text-[#ea580c] text-[11px] font-bold px-1.5 py-3 rounded-lg shadow-xs tracking-wider"
              style={{ writingMode: 'vertical-rl' }}
            >
              {galleryItems[1].tag}
            </span>
          </div>
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors" />
        </div>

        {/* Image 3: Bottom Left */}
        <div
          onClick={() => setSelectedPhoto(galleryItems[2])}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <img
            src={galleryItems[2].image}
            alt={galleryItems[2].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge: "Dental Treatments" (peach/coral vertical tag on left edge) */}
          <div className="absolute bottom-6 left-3 sm:left-4 z-10">
            <span
              className="inline-block bg-[#ffeedb] text-[#ea580c] text-[11px] font-bold px-1.5 py-3 rounded-lg shadow-xs tracking-wider"
              style={{ writingMode: 'vertical-rl' }}
            >
              {galleryItems[2].tag}
            </span>
          </div>
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors" />
        </div>

        {/* Image 4: Bottom Right */}
        <div
          onClick={() => setSelectedPhoto(galleryItems[3])}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <img
            src={galleryItems[3].image}
            alt={galleryItems[3].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge: "Teeth Alignment" (horizontal light blue pill) */}
          <div className="absolute bottom-4 right-4 z-10">
            <span className="inline-block bg-[#d4f2fc] text-[#0369a1] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
              {galleryItems[3].tag}
            </span>
          </div>
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors" />
        </div>

      </div>

      {/* Feature Highlights bar */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/50">
          <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            State-of-the-art 3D Digital Scanners
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50">
          <Sparkles className="w-5 h-5 text-[#f2542d] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            Pain-Free & Anxiety-Free Protocols
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/50">
          <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            Transparent & Upfront Pricing (NPR)
          </span>
        </div>
      </div>

      {/* Lightbox / Details Modal for clicked photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {selectedPhoto.tag}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {selectedPhoto.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedPhoto.description}
              </p>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="mt-6 w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
