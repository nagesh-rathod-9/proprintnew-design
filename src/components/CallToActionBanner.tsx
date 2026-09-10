import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CallToActionBannerProps {
  onOpenQuoteModal: () => void;
}

export const CallToActionBanner: React.FC<CallToActionBannerProps> = ({
  onOpenQuoteModal
}) => {
  const { isMarathi } = useApp();

  return (
    <section id="cta-quote-banner" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-[#080D1C] rounded-2xl p-6 sm:p-10 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        
        {/* Left Copy */}
        <div className="max-w-xl text-center md:text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight">
            {isMarathi ? 'तुमच्या कल्पना कागदावर आणण्यासाठी सज्ज आहात?' : 'Ready to Bring Your Ideas to Print?'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            {isMarathi 
              ? 'आजच मोफत कोटेशन मिळवा आणि एकत्र काहीतरी अप्रतिम तयार करूया.' 
              : "Get a free quote today and let's create something amazing together."}
          </p>
        </div>

        {/* Right CTA Button */}
        <button
          onClick={onOpenQuoteModal}
          className="inline-flex items-center justify-center gap-2 bg-[#E90046] hover:bg-[#d0003e] active:scale-95 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 group whitespace-nowrap"
        >
          <span>{isMarathi ? 'मोफत कोटेशन मिळवा' : 'Get a Free Quote'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

      </div>
    </section>
  );
};
