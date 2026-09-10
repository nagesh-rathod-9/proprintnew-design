import React from 'react';
import { ShieldCheck, Truck, Palette, Headphones } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TrustBadges: React.FC = () => {
  const { isMarathi } = useApp();

  const benefits = [
    {
      id: 'in-house',
      icon: ShieldCheck,
      title: isMarathi ? '१००% इन-हाउस प्रिंटिंग' : '100% In-House Printing',
      description: isMarathi 
        ? 'उत्कृष्ट गुणवत्तेसाठी संपूर्ण उत्पादन नियंत्रण.' 
        : 'Complete production control for consistent quality.',
    },
    {
      id: 'dispatch',
      icon: Truck,
      title: isMarathi ? '२४-४८ तासांत डिस्पॅच' : '24–48 Hr Dispatch',
      description: isMarathi 
        ? 'संपूर्ण भारतात जलद आणि सुरक्षित डिलिव्हरी.' 
        : 'Fast and reliable delivery across India.',
    },
    {
      id: 'color-matching',
      icon: Palette,
      title: isMarathi ? 'कलर मॅचिंग गॅरंटी' : 'Color Matching Guarantee',
      description: isMarathi 
        ? 'तुमच्या ब्रँडचे अचूक आणि एकसमान रंग.' 
        : 'Accurate and consistent brand colors.',
    },
    {
      id: 'support',
      icon: Headphones,
      title: isMarathi ? 'समर्पित सपोर्ट डेस्क' : 'Dedicated Support',
      description: isMarathi 
        ? 'चॅट, कॉल किंवा व्हॉट्सॲप — सदैव मदतीसाठी.' 
        : "Chat, call or WhatsApp — we're always here to help.",
    },
  ];

  return (
    <section id="trust-benefits-strip" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs">
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible lg:grid-cols-4 gap-4 sm:gap-6 lg:divide-x divide-slate-100 pb-1 lg:pb-0 scrollbar-none snap-x">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex-none w-[240px] sm:w-[260px] lg:w-auto snap-start flex items-start gap-3.5 ${
                  idx !== 0 ? 'lg:pl-6' : ''
                }`}
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-[#E90046]">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
