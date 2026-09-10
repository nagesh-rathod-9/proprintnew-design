import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, X } from 'lucide-react';
import { apiFetch, getFullImageUrl, useApp } from '../context/AppContext';
import { PortfolioItem } from '../types';

interface GraphicDesignPortfolioProps {
  onOpenWhatsApp?: (message?: string) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
}

export const GraphicDesignPortfolio: React.FC<GraphicDesignPortfolioProps> = ({
  onOpenWhatsApp,
  onOpenQuoteModal
}) => {
  const { isMarathi } = useApp();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[] | null>(null);
  const navigate = useNavigate();
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    apiFetch('/api/portfolio')
      .then(async (response) => {
        if (!response.ok) throw new Error('Portfolio API request failed');
        const data = await response.json();
        const items = Array.isArray(data.portfolio) ? data.portfolio : [];
        setPortfolioItems(items
          .filter((item: PortfolioItem) => item.image)
          .map((item: PortfolioItem) => ({
            ...item,
            image: getFullImageUrl(item.image)
          })));
      })
      .catch(() => setPortfolioItems([]));
  }, []);

  return (
    <section id="portfolio-section" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Section Header matching Reference Image */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          {/* Eyebrow: 📌 OUR WORK */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-extrabold text-[#E90046] tracking-wider uppercase mb-0.5 sm:mb-1 whitespace-nowrap">
            <span>📌</span>
            <span>{isMarathi ? 'आमची निवडक कामे' : 'OUR WORK'}</span>
          </div>
          {/* Main Title: Featured Design Portfolio */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight whitespace-nowrap">
            {isMarathi ? 'वैशिष्ट्यपूर्ण डिझाईन पोर्टफोलिओ' : 'Featured Design Portfolio'}
          </h2>
        </div>

        {/* Right Link: View Full Portfolio → */}
        <button
          onClick={() => navigate('/portfolio')}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E90046] hover:text-[#d0003e] transition-colors cursor-pointer group shrink-0 whitespace-nowrap pb-0.5"
        >
          <span>{isMarathi ? 'सर्व पहा' : 'View Full'}</span>
          <span className="hidden xs:inline">{isMarathi ? ' पोर्टफोलिओ' : ' Portfolio'}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 5 Cards Row: strictly 1 row on mobile with horizontal scroll, responsive 5-cols on large screens */}
      <div className="flex lg:grid overflow-x-auto lg:overflow-visible lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 pb-2 lg:pb-0 scrollbar-none snap-x">
        {(portfolioItems || []).map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModalItem(item)}
            className="flex-none w-[160px] sm:w-[185px] lg:w-auto snap-start group bg-white rounded-xl border border-[#E7EAF0] p-2.5 sm:p-3 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-2.5 border border-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="w-8 h-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Label below image */}
            <div className="text-center pt-1 pb-0.5">
              <h3 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#E90046] transition-colors line-clamp-1">
                {isMarathi ? item.titleMr || item.title : item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Preview Modal for Selected Portfolio Item */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <span className="text-[11px] font-extrabold uppercase text-[#E90046] tracking-wider">
                {activeModalItem.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {activeModalItem.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeModalItem.description}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveModalItem(null);
                    if (onOpenQuoteModal) onOpenQuoteModal(activeModalItem.title);
                  }}
                  className="flex-1 py-2.5 bg-[#E90046] hover:bg-[#d0003e] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Get Quote for Similar Work
                </button>

                <button
                  onClick={() => {
                    const msg = `Hello Proprint! I would like custom printing for ${activeModalItem.title}.`;
                    setActiveModalItem(null);
                    if (onOpenWhatsApp) onOpenWhatsApp(msg);
                  }}
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
