import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AllProductsView } from '../components/AllProductsView';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductsPageProps {
  onSelectProduct?: (product: Product) => void;
  onOpenQuoteModal?: (productName?: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onSelectProduct,
  onOpenQuoteModal
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchQuery, setSelectedCategory } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || params.get('search') || '');
    setSelectedCategory(params.get('category') || 'all');
  }, [location.search, setSearchQuery, setSelectedCategory]);

  return (
    <div className="py-4">
      <AllProductsView
        onSelectProduct={(p) => {
          if (onSelectProduct) onSelectProduct(p);
          navigate(`/product/${p.id}`);
        }}
        onOpenQuoteModal={onOpenQuoteModal}
      />
    </div>
  );
};
