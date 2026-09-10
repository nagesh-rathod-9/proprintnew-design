import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { CategoryId } from '../types';
import { useApp } from '../context/AppContext';

interface QuickCategoriesProps {
  activeCategory?: CategoryId | string;
  onSelectCategory?: (categoryId: CategoryId | string) => void;
}

const CATEGORY_NAMES_MR: Record<string, { name: string; subtitle: string }> = {
  'visiting-cards': { name: 'व्हिजिटिंग कार्ड्स', subtitle: '' },
  'letterheads': { name: 'लेटर हेड्स', subtitle: 'पॅम्प्लेट्स' },
  'envelopes': { name: 'पाकिटे व कव्हर्स', subtitle: '' },
  'invitation-cards': { name: 'निमंत्रण पत्रिका', subtitle: '' },
  'catalogs': { name: 'कॅटलॉग', subtitle: 'ब्रोशर्स' },
  'full-sheet': { name: 'फुल शीट', subtitle: 'प्रिंटिंग' },
  'paper-board-files': { name: 'पेपर बोर्ड', subtitle: 'फाईल्स' },
  'pp-files': { name: 'पीपी फाईल्स', subtitle: '' },
  'paper-shopping-bags': { name: 'पेपर शॉपिंग', subtitle: 'बॅग्ज' }
};

export const QuickCategories: React.FC<QuickCategoriesProps> = ({
  activeCategory: propActiveCategory,
  onSelectCategory: propOnSelectCategory,
}) => {
  const { isMarathi, selectedCategory, setSelectedCategory, categories } = useApp();
  const navigate = useNavigate();

  const currentCategory = propActiveCategory !== undefined ? propActiveCategory : selectedCategory;
  const categoryList = categories && categories.length > 0 ? categories : [];

  const handleCategoryClick = (catId: CategoryId | string) => {
    if (propOnSelectCategory) {
      propOnSelectCategory(catId);
    } else {
      setSelectedCategory(catId);
      if (catId !== 'all') {
        navigate(`/products?category=${catId}`);
      } else {
        navigate('/products');
      }
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200/90 py-2 sm:py-2.5 lg:py-2 shadow-2xs font-marathi">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8">
        
        {/* Horizontal scroll container with touch snap */}
        <div className="mobile-horizontal-scroll flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar justify-start">
          
          {/* 1. All Services Red Button */}
          <button
            id="cat-pill-all"
            onClick={() => handleCategoryClick('all')}
            className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer shadow-sm ${
              currentCategory === 'all'
                ? 'bg-[#FF0038] hover:bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isMarathi ? 'सर्व सेवा' : 'All Services'}</span>
          </button>

          {/* 1.5 Special 3D Studio (Cards & Stickers) Fast Access Pill */}
          <button
            id="cat-pill-3d-studio"
            onClick={() => navigate('/design-studio')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="whitespace-nowrap">{isMarathi ? '३D स्टुडिओ: कार्ड्स व स्टिकर्स' : '3D Studio: Cards & Stickers'}</span>
          </button>

          {/* 2. Category Pills with Micro-Thumbnails */}
          {categoryList.map((cat) => {
            const isSelected = currentCategory === cat.id;
            const mrInfo = CATEGORY_NAMES_MR[cat.id];
            const nameLabel = isMarathi ? (mrInfo?.name || cat.name) : cat.name;
            const subLabel = isMarathi ? (mrInfo?.subtitle || cat.subtitle) : cat.subtitle;

            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer border text-sm shadow-2xs ${
                  isSelected
                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold ring-2 ring-rose-400/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 hover:text-slate-950 font-semibold'
                }`}
              >
                {/* Micro thumbnail */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Category Label & Subtitle */}
                <span className="whitespace-nowrap flex items-center gap-1">
                  <span>{nameLabel}</span>
                  {subLabel ? (
                    <span className="text-xs font-normal text-slate-500">
                      ({subLabel})
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
};
