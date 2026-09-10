import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { apiFetch, useApp } from '../context/AppContext';
import { ReviewRecord } from '../types';

export const ClientReviewsSection: React.FC = () => {
  const { isMarathi } = useApp();
  const [reviews, setReviews] = useState<ReviewRecord[] | null>(null);

  useEffect(() => {
    apiFetch('/api/reviews')
      .then(async (response) => {
        if (!response.ok) throw new Error('Reviews API request failed');
        const data = await response.json();
        setReviews(Array.isArray(data.reviews)
          ? data.reviews.filter((review: ReviewRecord) => review.status === 'Approved')
          : []);
      })
      .catch(() => setReviews([]));
  }, []);

  return (
    <section id="testimonials-section" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Section Header matching Reference Image */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          {/* Eyebrow: 🏢 TRUSTED BY BUSINESSES */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-extrabold text-[#E90046] tracking-wider uppercase mb-0.5 sm:mb-1 whitespace-nowrap">
            <span>🏢</span>
            <span>{isMarathi ? '५००+ व्यवसायांचा विश्वास' : 'TRUSTED BY BUSINESSES'}</span>
          </div>
          {/* Main Title: What Our Customers Say */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight whitespace-nowrap">
            {isMarathi ? 'ग्राहक काय म्हणतात' : 'What Our Customers Say'}
          </h2>
        </div>

        {/* Right Link: View Full Reviews → */}
        <button
          onClick={() => {
            const el = document.getElementById('testimonials-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E90046] hover:text-[#d0003e] transition-colors cursor-pointer group shrink-0 whitespace-nowrap pb-0.5"
        >
          <span>{isMarathi ? 'सर्व पहा' : 'View Full'}</span>
          <span className="hidden xs:inline">{isMarathi ? ' अभिप्राय' : ' Reviews'}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 3 Testimonial Cards: strictly 1 row on mobile with horizontal scroll, responsive 3-col grid on md/lg */}
      <div className="flex md:grid overflow-x-auto md:overflow-visible md:grid-cols-3 gap-4 sm:gap-6 pb-2 md:pb-0 scrollbar-none snap-x">
        {(reviews || []).map((rev) => (
          <div
            key={rev.id}
            className="flex-none w-[270px] sm:w-[320px] md:w-auto snap-start bg-white rounded-xl sm:rounded-2xl border border-[#E7EAF0] p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* User Header: Circular Initial + Name & Role */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-full bg-[#080D1C] text-white flex items-center justify-center font-bold text-base shrink-0 border border-slate-700">
                  {rev.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
                    {rev.customerName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rev.customerRole || 'Customer'}
                  </p>
                </div>
              </div>

              {/* Star Rating Row */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(rev.rating) ? 'fill-current' : 'fill-slate-200 text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {rev.rating.toFixed(1)}
                </span>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-[13px] text-slate-600 italic leading-relaxed">
                  "{rev.comment}"
              </p>
            </div>

            {/* Bottom Status Badge: Verified Customer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5 fill-emerald-100" />
              <span>{rev.verifiedBuyer ? 'Verified Customer' : 'Customer Review'}</span>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
