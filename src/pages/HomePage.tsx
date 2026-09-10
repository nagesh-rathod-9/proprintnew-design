import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryGrid } from '../components/CategoryGrid';
import { BestSellingGrid } from '../components/BestSellingGrid';
import { TrustBadges } from '../components/TrustBadges';
import { GraphicDesignPortfolio } from '../components/GraphicDesignPortfolio';
import { ClientReviewsSection } from '../components/ClientReviewsSection';
import { CallToActionBanner } from '../components/CallToActionBanner';
import { Product } from '../types';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenWhatsApp: (message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onOpenQuoteModal,
  onOpenWhatsApp
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 bg-white min-h-screen">
      
      {/* 1. Hero Section matching Reference Image */}
      <HeroBanner 
        onOpenQuote={() => onOpenQuoteModal()} 
      />

      {/* 2. Shop by Category */}
      <CategoryGrid />

      {/* 3. Best Selling Products */}
      <BestSellingGrid 
        onSelectProduct={(p) => {
          if (onSelectProduct) onSelectProduct(p);
          navigate(`/product/${p.id}`);
        }}
        onOpenQuoteModal={onOpenQuoteModal}
      />

      {/* 4. Trust & Benefits Strip (100% In-House, 24-48 Hr Dispatch, Color Match, Support) */}
      <TrustBadges />

      {/* 5. Featured Design Portfolio */}
      <GraphicDesignPortfolio
        onOpenWhatsApp={onOpenWhatsApp}
        onOpenQuoteModal={onOpenQuoteModal}
      />

      {/* 6. What Our Customers Say (Testimonials) */}
      <ClientReviewsSection />

      {/* 7. Ready to Bring Your Ideas to Print? (Navy CTA Banner) */}
      <CallToActionBanner 
        onOpenQuoteModal={() => onOpenQuoteModal()} 
      />

    </div>
  );
};
