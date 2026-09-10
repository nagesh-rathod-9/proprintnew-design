import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Category, CategoryId } from '../types';
import { apiFetch, getFullImageUrl, useApp } from '../context/AppContext';

interface CategoryGridProps {
  onSelectCategory?: (categoryId: CategoryId | 'all') => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
}) => {
  const { isMarathi, setSelectedCategory } = useApp();
  const [apiCategories, setApiCategories] = useState<Category[] | null>(null);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch('/api/categories')
      .then(async (response) => {
        if (!response.ok) throw new Error('Category API request failed');
        const data = await response.json();
        const categories = Array.isArray(data.categories) ? data.categories : [];
        setApiCategories(
          categories
            .filter((category: Category) => category.image)
            .map((category: Category) => ({
              ...category,
              image: getFullImageUrl(category.image)
            }))
        );
      })
      .catch(() => setApiCategories([]));
  }, []);

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId as any);
    } else {
      if (setSelectedCategory) {
        setSelectedCategory(catId as any);
      }
      navigate(`/products?category=${catId}`);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-section" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Section Header matching Reference Image */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          {/* Eyebrow: ☆ EXPLORE OUR RANGE */}
          <div className="flex items-center gap-1 text-[11px] sm:text-[13px] font-extrabold text-[#E90046] tracking-wider uppercase mb-0.5 sm:mb-1 whitespace-nowrap">
            <span>☆</span>
            <span>{isMarathi ? 'आमची संपूर्ण श्रेणी एक्सप्लोर करा' : 'EXPLORE OUR RANGE'}</span>
          </div>
          {/* Main Title: Shop by Category */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight whitespace-nowrap">
            {isMarathi ? 'कॅटेगरीनुसार खरेदी करा' : 'Shop by Category'}
          </h2>
        </div>

        {/* Right Link: View All Categories → */}
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E90046] hover:text-[#d0003e] transition-colors cursor-pointer group shrink-0 whitespace-nowrap pb-0.5"
        >
          <span>{isMarathi ? 'सर्व पहा' : 'View All'}</span>
          <span className="hidden xs:inline">{isMarathi ? ' कॅटेगरीज' : ' Categories'}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Cards Container with Right Chevron Arrow Button */}
      <div className="relative group/scroll">
        
        {/* Horizontal Scroll / Grid */}
        <div 
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {(apiCategories || []).map((item) => (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex-none w-[150px] sm:w-[170px] md:w-[185px] snap-start bg-white rounded-xl border border-[#E7EAF0] p-3 sm:p-4 text-center hover:border-[#E90046] hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between group"
            >
              {/* Image Box */}
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 mb-3 flex items-center justify-center border border-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Count */}
              <div className="w-full">
                <h3 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#E90046] transition-colors line-clamp-1">
                  {isMarathi ? item.nameMr || item.name : item.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {item.itemCount || 0}+ Products
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Right Scroll Arrow Button matching Reference Design */}
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-slate-700 hover:text-[#E90046] hover:border-[#E90046] transition-all cursor-pointer z-20"
          aria-label="Scroll Categories Right"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>

      </div>

    </section>
  );
};
