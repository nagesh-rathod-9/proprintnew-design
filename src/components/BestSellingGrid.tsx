import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { apiFetch, getFullImageUrl, useApp } from '../context/AppContext';

interface BestSellingGridProps {
  products?: Product[];
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onSelectProduct?: (product: Product) => void;
  onCustomizeProduct?: (product: Product) => void;
  onOpenDesignStudio?: (product: Product) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
  onViewAll?: () => void;
}

interface BestSellerCardDef {
  id: string;
  name: string;
  nameMr: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  image: string;
  categoryId: string;
  fallbackProductId?: string;
}

const BEST_SELLER_ITEMS: BestSellerCardDef[] = [
  {
    id: 'prod-visiting-cards-bestseller',
    name: 'Premium Visiting Cards',
    nameMr: 'प्रीमियम व्हिजिटिंग कार्ड्स',
    rating: 4.8,
    reviewsCount: 320,
    price: 499,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    categoryId: 'visiting-cards',
    fallbackProductId: 'prod-luxury-velvet-card'
  },
  {
    id: 'prod-custom-brochures-bestseller',
    name: 'Custom Brochures',
    nameMr: 'कस्टम ब्रोशर्स व पॅम्प्लेट्स',
    rating: 4.7,
    reviewsCount: 210,
    price: 599,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    categoryId: 'brochures',
    fallbackProductId: 'prod-premium-brochure'
  },
  {
    id: 'prod-custom-stickers-bestseller',
    name: 'Custom Stickers',
    nameMr: 'कस्टम लेबल्स व स्टिकर्स',
    rating: 4.9,
    reviewsCount: 180,
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&auto=format&fit=crop&q=80',
    categoryId: 'stickers',
    fallbackProductId: 'prod-diecut-waterproof-sticker'
  },
  {
    id: 'prod-packaging-boxes-bestseller',
    name: 'Packaging Boxes',
    nameMr: 'पॅकेजिंग बॉक्सेस',
    rating: 4.8,
    reviewsCount: 140,
    price: 45,
    originalPrice: 70,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    categoryId: 'packaging',
    fallbackProductId: 'prod-custom-packaging-box'
  },
  {
    id: 'prod-paper-bags-bestseller',
    name: 'Paper Bags',
    nameMr: 'पेपर शॉपिंग बॅग्ज',
    rating: 4.7,
    reviewsCount: 98,
    price: 25,
    originalPrice: 40,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    categoryId: 'paper-shopping-bags',
    fallbackProductId: 'prod-luxury-boutique-bag'
  },
  {
    id: 'prod-letter-heads-bestseller',
    name: 'Letter Heads',
    nameMr: 'एक्झिक्युटिव्ह लेटरहेड्स',
    rating: 4.8,
    reviewsCount: 120,
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    categoryId: 'letterheads',
    fallbackProductId: 'prod-executive-bond-letterhead'
  }
];

export const BestSellingGrid: React.FC<BestSellingGridProps> = ({
  onSelectProduct,
  onViewAll
}) => {
  const { isMarathi, wishlistIds, toggleWishlist, products = [] } = useApp();
  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/products?bestSeller=true&limit=6')
      .then(async (response) => {
        if (!response.ok) throw new Error('Best-selling products API request failed');
        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : [];
        setApiProducts(products.map((product: Product) => ({
          ...product,
          image: getFullImageUrl(product.image),
          galleryImages: Array.isArray(product.galleryImages)
            ? product.galleryImages.map((image) => getFullImageUrl(image))
            : []
        })));
      })
      .catch(() => setApiProducts([]));
  }, []);

  const handleCardClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <section id="bestsellers-section" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Section Header matching Reference Design */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          {/* Eyebrow: ⚡ POPULAR CHOICES */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-extrabold text-[#E90046] tracking-wider uppercase mb-0.5 sm:mb-1 whitespace-nowrap">
            <span>⚡</span>
            <span>{isMarathi ? 'सर्वाधिक पसंतीची उत्पादने' : 'POPULAR CHOICES'}</span>
          </div>
          {/* Main Title: Best Selling Products */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight whitespace-nowrap">
            {isMarathi ? 'सर्वाधिक विकली जाणारी उत्पादने' : 'Best Selling Products'}
          </h2>
        </div>

        {/* Right Link: View All Products → */}
        <button
          onClick={onViewAll || (() => navigate('/products'))}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#E90046] hover:text-[#d0003e] transition-colors cursor-pointer group shrink-0 whitespace-nowrap pb-0.5"
        >
          <span>{isMarathi ? 'सर्व पहा' : 'View All'}</span>
          <span className="hidden xs:inline">{isMarathi ? ' उत्पादने' : ' Products'}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 6 Products Grid: strictly 1 row on mobile with horizontal scroll, responsive grid on md/lg */}
      <div className="mobile-horizontal-scroll flex md:grid overflow-x-auto md:overflow-visible md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 pb-2 md:pb-0 scrollbar-none snap-x">
        {(apiProducts || []).map((product) => {
          const isWishlisted = (wishlistIds || []).includes(product.id);

          return (
            <div
              key={product.id}
              className="flex-none w-[170px] sm:w-[190px] md:w-auto snap-start bg-white rounded-xl border border-[#E7EAF0] p-3 sm:p-3.5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Image Container with Top-Right Heart Wishlist Button */}
                <div 
                  onClick={() => handleCardClick(product)}
                  className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-50 mb-3 border border-slate-100 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Subtle Circular Wishlist Heart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isWishlisted 
                        ? 'bg-rose-50 text-[#E90046]' 
                        : 'bg-white/90 text-slate-400 hover:text-[#E90046] hover:bg-white shadow-xs'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Rating Row: ★ 4.8 (320) */}
                <div className="flex items-center gap-1.5 text-xs mb-1.5">
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{product.rating.toFixed(1)}</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({product.reviewsCount})
                  </span>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => handleCardClick(product)}
                  className="text-xs sm:text-[13px] font-bold text-[#0F172A] line-clamp-1 hover:text-[#E90046] transition-colors cursor-pointer mb-2"
                >
                  {isMarathi ? product.nameMr || product.name : product.name}
                </h3>

                {/* Price Row: Current Price + Strikethrough Old Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-base sm:text-lg font-black text-[#0F172A]">
                    ₹{product.basePrice}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.originalPrice || product.basePrice}
                  </span>
                </div>
              </div>

              {/* Action Button: "View Details" in Dark Navy #080D1C */}
              <button
                type="button"
                onClick={() => handleCardClick(product)}
                className="w-full py-2 bg-[#080D1C] hover:bg-slate-800 active:scale-98 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                {isMarathi ? 'माहिती पहा' : 'View Details'}
              </button>

            </div>
          );
        })}
      </div>

    </section>
  );
};
