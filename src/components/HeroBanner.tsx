import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Package, 
  Palette, 
  Truck, 
  ArrowRight, 
  CreditCard,
  FileText,
  Tag
} from 'lucide-react';
import heroPackagingImg from '../assets/images/proprint_packaging_hero_1788925583688.jpg';

interface HeroBannerProps {
  onShopNow?: () => void;
  onGetQuote?: () => void;
  onOpenQuote?: () => void;
}

const HERO_SLIDES = [
  {
    id: 'packaging-boxes',
    tag: 'PREMIUM PRINTING SOLUTIONS',
    titleBlack: 'Custom',
    titlePink: 'Packaging Boxes',
    subtitle: 'Pack your ideas. Print your brand.',
    ctaText: 'Explore Packaging',
    ctaLink: '/products?category=packaging',
    cornerLabel: 'PRINT EXPLORE GROW',
    image: heroPackagingImg,
    fallbackImg: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80',
    benefits: [
      { icon: Sparkles, text: 'Premium Quality' },
      { icon: Package, text: 'Custom Sizes & Designs' },
      { icon: Palette, text: 'Vibrant Color Printing' },
      { icon: Truck, text: 'On-Time Delivery' },
    ]
  },
  {
    id: 'visiting-cards',
    tag: 'FIRST IMPRESSIONS MATTER',
    titleBlack: 'Luxury',
    titlePink: 'Visiting Cards',
    subtitle: 'Velvet matte textures, raised spot UV & metallic gold foil.',
    ctaText: 'Explore Cards',
    ctaLink: '/products?category=visiting-cards',
    cornerLabel: 'PRINT EXPLORE GROW',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    benefits: [
      { icon: CreditCard, text: '400+ GSM Art Board' },
      { icon: Sparkles, text: 'Spot UV & Foil' },
      { icon: Palette, text: 'Offset High Precision' },
      { icon: Truck, text: '24-Hr Express Dispatch' },
    ]
  },
  {
    id: 'brochures-catalogs',
    tag: 'CORPORATE BRANDING',
    titleBlack: 'Flyers &',
    titlePink: 'Brochures',
    subtitle: 'Multi-fold brochures and corporate saddle-stitched catalogs.',
    ctaText: 'Explore Brochures',
    ctaLink: '/products?category=brochures',
    cornerLabel: 'PRINT EXPLORE GROW',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    benefits: [
      { icon: FileText, text: 'Tri-Fold & Bi-Fold' },
      { icon: Sparkles, text: '170-300 GSM Silk' },
      { icon: Palette, text: 'Heidelberg Offset' },
      { icon: Truck, text: 'Bulk Best Pricing' },
    ]
  },
  {
    id: 'stickers-labels',
    tag: 'PACKAGING LABELS',
    titleBlack: 'Custom',
    titlePink: 'Stickers & Labels',
    subtitle: 'Waterproof die-cut stickers for jars, boxes, pouches & products.',
    ctaText: 'Explore Stickers',
    ctaLink: '/products?category=stickers',
    cornerLabel: 'PRINT EXPLORE GROW',
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=1200&auto=format&fit=crop&q=80',
    fallbackImg: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=1200&auto=format&fit=crop&q=80',
    benefits: [
      { icon: Tag, text: 'Laser Die-Cut' },
      { icon: Sparkles, text: 'Waterproof Vinyl' },
      { icon: Palette, text: 'Metallic Chrome Finish' },
      { icon: Truck, text: 'Starting at ₹79' },
    ]
  }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onGetQuote, onOpenQuote }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { activeHeroSlides } = useApp();
  const slides = activeHeroSlides.length > 0
    ? activeHeroSlides.map((slide, index) => {
        const fallback = HERO_SLIDES[index % HERO_SLIDES.length];
        return {
          ...fallback,
          id: slide.id,
          tag: slide.tag || fallback.tag,
          titleBlack: slide.title1 || fallback.titleBlack,
          titlePink: slide.title2 || slide.highlight || fallback.titlePink,
          subtitle: slide.subtitle || fallback.subtitle,
          ctaText: slide.buttonText || fallback.ctaText,
          ctaLink: slide.categoryLink || fallback.ctaLink,
          image: slide.image || fallback.image,
        };
      })
    : HERO_SLIDES;

  // Auto-slide every 6 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  useEffect(() => {
    if (activeSlideIndex >= slides.length) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, slides.length]);

  const currentSlide = slides[activeSlideIndex];

  const handleCtaClick = () => {
    navigate(currentSlide.ctaLink);
  };

  return (
    <section 
      id="hero-banner-section" 
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Hero Card Container matching Reference Design */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden shadow-xs">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8FAFC] to-slate-100/80 pointer-events-none" />

        {/* Top Right Corner Label: "PRINT EXPLORE GROW" */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20 hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          <span>PRINT</span>
          <span className="text-[#E90046]">•</span>
          <span>EXPLORE</span>
          <span className="text-[#E90046]">•</span>
          <span>GROW</span>
        </div>

        {/* Main Content Grid: Split Left & Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[420px] lg:min-h-[460px] items-center">
          
          {/* LEFT COLUMN: Typography & CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-8 md:p-10 lg:pl-12 lg:pr-6 flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Small Pink Eyebrow */}
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#E90046]">
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Big Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black tracking-tight leading-[1.1] text-[#0F172A]">
                  {currentSlide.titleBlack}{' '}
                  <span className="text-[#E90046] block sm:inline">
                    {currentSlide.titlePink}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-lg">
                  {currentSlide.subtitle}
                </p>

                {/* 4 Benefit Items Row (Exact matching icons & text) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 pb-2">
                  {currentSlide.benefits.map((benefit, bIndex) => {
                    const IconComp = benefit.icon;
                    return (
                      <div key={bIndex} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                          <IconComp className="w-3.5 h-3.5 text-[#E90046]" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-tight">
                          {benefit.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button Row: strictly side-by-side without vertical stacking */}
                <div className="pt-2 sm:pt-3 flex flex-row items-center gap-2 sm:gap-3 max-w-lg">
                  <button
                    id="hero-explore-cta-btn"
                    onClick={handleCtaClick}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#E90046] hover:bg-[#d0003e] active:scale-95 text-white font-bold text-xs sm:text-sm px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group whitespace-nowrap min-w-0"
                  >
                    <span className="truncate">{currentSlide.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={onGetQuote || onOpenQuote}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap min-w-0"
                  >
                    <span className="truncate">Get Custom Quote</span>
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: Studio Packaging Mockup Presentation */}
          <div className="lg:col-span-6 xl:col-span-6 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-md border border-slate-200/80 group">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.titlePink}
                    className="w-full h-full object-contain object-center transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = currentSlide.fallbackImg;
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Floating watermark pill on mockup */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200/60">
                100% In-House Production
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Carousel Indicator Dots (4 dots with active dot in pink pill) */}
        <div className="relative z-20 pb-4 pt-1 flex items-center justify-center gap-2">
          {slides.map((slide, sIdx) => {
            const isActive = activeSlideIndex === sIdx;
            return (
              <button
                key={slide.id}
                onClick={() => setActiveSlideIndex(sIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive 
                    ? 'w-6 h-2 bg-[#E90046]' 
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${sIdx + 1}`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};
