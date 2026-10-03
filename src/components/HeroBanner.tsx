
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onShopNow?: () => void;
  onGetQuote?: () => void;
  onOpenQuote?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onGetQuote,
  onOpenQuote,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();
  const { activeHeroSlides } = useApp();

  const slides = activeHeroSlides.filter((slide) =>
    Boolean(slide.image?.trim())
  );

  useEffect(() => {
    if (isHovered || slides.length < 2) return;

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

  if (slides.length === 0) return null;

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleCtaClick = () => {
    navigate(currentSlide.categoryLink || '/products');
  };

  return (
    <section
      id="hero-banner-section"
      className="mx-auto w-full min-w-0 max-w-[1440px] px-4 pt-3 pb-5 sm:px-6 sm:pt-4 sm:pb-6 lg:px-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative isolate w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#FCF9FC] via-[#F8FAFC] to-[#F1F5F9] shadow-sm sm:rounded-3xl">

        {/* Subtle background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-28 h-64 w-64 rounded-full bg-pink-100/30 blur-3xl" />
          <div className="absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl" />
        </div>

        {/* Main hero layout */}
        <div className="relative z-10 grid min-w-0 grid-cols-1 items-center lg:grid-cols-12">

          {/* Left: Text and actions */}
          <div className="flex min-w-0 max-w-full flex-col justify-center px-6 pt-8 pb-5 sm:px-9 sm:pt-10 sm:pb-6 md:px-12 lg:col-span-5 lg:px-10 lg:py-10 xl:pl-14 xl:pr-6">

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col items-start"
              >
                {/* Eyebrow */}
                {currentSlide.tag?.trim() && (
                  <div className="mb-3 flex items-center gap-2 sm:mb-4">
                    <span className="h-[2px] w-8 rounded-full bg-[#E90046]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E90046] sm:text-sm">
                      {currentSlide.tag}
                    </span>
                  </div>
                )}

                {/* Main heading */}
                <h1 className="w-full max-w-[600px] break-words text-[32px] font-extrabold leading-[1.08] tracking-tight text-[#0F172A] sm:text-[40px] md:text-[46px] lg:text-[40px] xl:text-[50px]">
                  {currentSlide.title1}{' '}
                  <span className="text-[#E90046]">
                    {currentSlide.title2 || currentSlide.highlight}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-4 max-w-[440px] text-sm font-medium leading-relaxed text-slate-600 sm:mt-5 sm:text-base lg:text-[16px] xl:text-lg">
                  {currentSlide.subtitle}
                </p>

                {/* CTA buttons */}
                <div className="mt-6 flex w-full max-w-[390px] flex-row items-center gap-3 sm:mt-7 sm:w-auto sm:gap-4">
                  <button
                    id="hero-explore-cta-btn"
                    onClick={handleCtaClick}
                    className="group inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E90046] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D0003E] hover:shadow-md active:scale-[0.98] sm:flex-initial sm:px-6 sm:py-3.5"
                  >
                    <span className="truncate">
                      {currentSlide.buttonText}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={onGetQuote || onOpenQuote}
                    className="inline-flex min-w-0 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E90046]/50 hover:bg-pink-50/50 hover:text-[#E90046] active:scale-[0.98] sm:flex-initial sm:px-5 sm:py-3.5"
                  >
                    <span className="truncate">
                      {currentSlide.quoteButtonText}
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Large product image */}
          <div className="relative flex min-w-0 max-w-full items-center justify-center px-4 pb-6 sm:px-6 sm:pb-7 lg:col-span-7 lg:h-full lg:px-5 lg:py-6 xl:px-7">
            <div className="relative h-[220px] w-full overflow-hidden rounded-xl border border-white/80 bg-white shadow-md shadow-slate-200/50 sm:h-[280px] md:h-[320px] lg:h-[300px] xl:h-[340px]">

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={currentSlide.image}
                    alt={
                      currentSlide.title2 ||
                      currentSlide.highlight ||
                      currentSlide.title1
                    }
                    className="h-full w-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {slides.length > 1 && (
          <div className="relative z-20 flex items-center justify-center gap-2 pb-4 sm:pb-5 lg:absolute lg:bottom-3 lg:left-0 lg:right-0 lg:pb-0">
            {slides.map((slide, sIdx) => {
              const isActive = activeSlideIndex === sIdx;

              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(sIdx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-7 bg-[#E90046]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${sIdx + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
