import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  ArrowRight,
  Package,
  Layers,
  FileText,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle,
  Truck,
  Phone,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProprintLogo } from './ProprintLogo';
import { Product } from '../types';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist?: () => void;
  onOpenAccount?: () => void;
  onOpenQuote: () => void;
  onOpenWhatsApp: () => void;
  onOpenTrackOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenQuote,
  onOpenWhatsApp,
  onOpenTrackOrder
}) => {
  const { 
    cart, 
    searchQuery, 
    setSearchQuery, 
    currentUser, 
    logout, 
    language,
    setLanguage,
    isMarathi,
    isGlobalLoading,
    products: appProducts = [],
    categories: appCategories = []
  } = useApp();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [allCategoriesDropdownOpen, setAllCategoriesDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [filteredSearchResults, setFilteredSearchResults] = useState<Product[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = Array.isArray(cart) ? cart.length : 0;

  // Search auto-complete logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const results = (appProducts || []).filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.nameMr?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      ).slice(0, 6);
      setFilteredSearchResults(results);
      setSearchDropdownOpen(true);
    } else {
      setFilteredSearchResults([]);
      setSearchDropdownOpen(false);
    }
  }, [searchQuery, appProducts]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setAllCategoriesDropdownOpen(false);
      }
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setProductsDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchDropdownOpen(false);
    setMobileSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleProductSelect = (prod: Product) => {
    setSearchDropdownOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${prod.id}`);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full bg-white shadow-xs">
      
      {/* ============================================================ */}
      {/* LEVEL 1: TOP MAIN HEADER (Dark Navy: #080D1C)               */}
      {/* Logo | Search Bar | Login | Cart | Get a Quote               */}
      {/* ============================================================ */}
      <div className="w-full bg-[#080D1C] text-white border-b border-slate-800/80">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1 text-slate-200 hover:text-white rounded-lg lg:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center group py-0.5" aria-label="Proprint Home">
              <ProprintLogo size="md" variant="light" showTagline={true} />
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) matching reference exactly */}
          <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-xl xl:max-w-2xl mx-2 xl:mx-6 relative">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 1) setSearchDropdownOpen(true);
                }}
                placeholder={isMarathi ? 'उत्पादने, कॅटेगरी किंवा प्रिंट सोल्यूशन्स शोधा...' : 'Search for products, categories or print solutions...'}
                className="w-full bg-white text-[#0F172A] placeholder:text-slate-400 text-[13px] font-normal pl-4 pr-12 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E90046]/40 transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 w-10 bg-[#E90046] hover:bg-[#d0003e] active:scale-95 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>

            {/* Auto-Complete Search Dropdown */}
            {searchDropdownOpen && filteredSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-[#0F172A] divide-y divide-slate-100 animate-in fade-in duration-150">
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>{isMarathi ? 'शोध परिणाम' : 'Products matching search'}</span>
                  <span className="text-[#E90046]">{filteredSearchResults.length} found</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filteredSearchResults.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleProductSelect(prod)}
                      className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-md object-cover shrink-0 border border-slate-200 bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {isMarathi && prod.nameMr ? prod.nameMr : prod.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {prod.tagline || prod.category || 'Printing Service'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#E90046]">₹{prod.basePrice}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-center text-xs font-semibold text-[#E90046] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View All Results for "{searchQuery}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions (Login | Cart | Get a Quote) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher Capsule [ EN | MR ] */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700/80 rounded-full p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#E90046] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  language === 'mr' ? 'bg-[#E90046] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Login / User Account */}
            <div ref={userMenuRef} className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-200 hover:text-white transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-800/60"
                  >
                    <User className="w-4 h-4 text-slate-300" />
                    <span className="hidden sm:inline-block max-w-[100px] truncate">
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline-block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#080D1C] rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 text-xs text-white divide-y divide-slate-800 animate-in fade-in duration-100">
                      <div className="px-3.5 py-2 border-b border-slate-800">
                        <p className="font-bold text-white truncate">{currentUser.name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email || currentUser.phone}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <User className="w-4 h-4 text-[#E90046]" />
                          <span>{isMarathi ? 'माझी प्रोफाइल' : 'My Profile'}</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <Package className="w-4 h-4 text-amber-400" />
                          <span>{isMarathi ? 'माझ्या ऑर्डर्स' : 'My Orders'}</span>
                        </Link>
                        {currentUser.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-amber-300 hover:bg-slate-800/80 font-semibold"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-400" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-[#E90046] hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{isMarathi ? 'साइन आउट' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-slate-200 hover:text-white transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-800/60"
                  aria-label="Login"
                >
                  <User className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline-block">{isMarathi ? 'लॉगिन' : 'Login'}</span>
                </Link>
              )}
            </div>

            {/* Cart with Counter Badge */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-slate-200 hover:text-white transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-800/60 relative"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#E90046] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-medium">{isMarathi ? 'कार्ट' : 'Cart'}</span>
            </button>

            </div>

        </div>

        {/* Expandable Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-800 bg-[#0B0F1D]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMarathi ? 'उत्पादने शोधा...' : 'Search products, categories...'}
                autoFocus
                className="w-full bg-white text-[#0F172A] text-xs pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E90046]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 w-8 bg-[#E90046] text-white rounded-md flex items-center justify-center"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* LEVEL 2: NAVIGATION BAR (White: #FFFFFF, Border: #E7EAF0)    */}
      {/* All Categories Button | Products | Services | Portfolio | ...*/}
      {/* ============================================================ */}
      <div className="hidden lg:block w-full bg-white border-b border-[#E7EAF0]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-6">
          
          {/* Left: Solid Pink "All Categories" Button with Dropdown */}
          <div ref={categoriesRef} className="relative shrink-0">
            <button
              onClick={() => setAllCategoriesDropdownOpen(!allCategoriesDropdownOpen)}
              className="bg-[#E90046] hover:bg-[#d0003e] active:scale-98 text-white font-bold text-xs sm:text-[13px] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Menu className="w-4 h-4 stroke-[2.2]" />
              <span>{isMarathi ? 'सर्व कॅटेगरीज' : 'All Categories'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${allCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Categories Dropdown Panel */}
            {allCategoriesDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
                <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E90046]">
                  {isMarathi ? 'प्रमुख प्रिंटिंग उत्पादने' : 'Print Categories'}
                </div>
                <div className="py-1">
                  <Link
                    to="/products"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-[#E90046] hover:bg-rose-50 transition-colors"
                  >
                    {isMarathi ? 'सर्व उत्पादने पहा (सर्व श्रेणी)' : 'View All Categories →'}
                  </Link>
                  <Link
                    to="/products?category=visiting-cards"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Visiting Cards (120+ Products)
                  </Link>
                  <Link
                    to="/products?category=envelopes"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Envelopes (50+ Products)
                  </Link>
                  <Link
                    to="/products?category=letterheads"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Letter Heads (40+ Products)
                  </Link>
                  <Link
                    to="/products?category=brochures"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Flyers & Brochures (80+ Products)
                  </Link>
                  <Link
                    to="/products?category=invitation-cards"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Invitation Cards (80+ Products)
                  </Link>
                  <Link
                    to="/products?category=packaging"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Packaging Boxes (60+ Products)
                  </Link>
                  <Link
                    to="/products?category=paper-shopping-bags"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Paper Bags (40+ Products)
                  </Link>
                  <Link
                    to="/products?category=stickers"
                    onClick={() => setAllCategoriesDropdownOpen(false)}
                    className="block px-4 py-1.5 text-xs text-slate-700 hover:text-[#E90046] hover:bg-slate-50 transition-colors"
                  >
                    Stickers & Labels (70+ Products)
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Center Navigation Links: Products ⌵ | Services ⌵ | Design Portfolio | Business Solutions | About Us | Support */}
          <nav className="flex items-center gap-6 xl:gap-8 text-[13px] font-medium text-[#0F172A]">
            
            {/* Products Dropdown */}
            <div ref={productsRef} className="relative">
              <button
                onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#E90046] transition-colors py-1 cursor-pointer font-medium"
              >
                <span>{isMarathi ? 'उत्पादने' : 'Products'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {productsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in duration-100">
                  <div className="py-1">
                    <Link
                      to="/products"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-2 font-bold text-[#E90046] hover:bg-rose-50"
                    >
                      All Products Overview
                    </Link>
                    <Link
                      to="/products?category=visiting-cards"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      Premium Visiting Cards
                    </Link>
                    <Link
                      to="/products?category=packaging"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      Packaging Boxes
                    </Link>
                    <Link
                      to="/products?category=brochures"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      Brochures & Catalogs
                    </Link>
                    <Link
                      to="/products?category=stickers"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      Waterproof Stickers
                    </Link>
                    <Link
                      to="/visiting-cards"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="block px-4 py-1.5 text-amber-700 font-semibold hover:bg-amber-50"
                    >
                      ✨ 3D Visiting Card Customizer
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#E90046] transition-colors py-1 cursor-pointer font-medium"
              >
                <span>{isMarathi ? 'सेवा' : 'Services'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in duration-100">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setServicesDropdownOpen(false);
                        onOpenQuote();
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      • In-House Offset Printing
                    </button>
                    <button
                      onClick={() => {
                        setServicesDropdownOpen(false);
                        onOpenQuote();
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      • High-Speed Digital Printing
                    </button>
                    <button
                      onClick={() => {
                        setServicesDropdownOpen(false);
                        onOpenQuote();
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      • Custom Box & Packaging Die-Cutting
                    </button>
                    <Link
                      to="/portfolio"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block px-4 py-1.5 hover:bg-slate-50 hover:text-[#E90046]"
                    >
                      • Graphic Design & Brand Identity
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Design Portfolio */}
            <Link
              to="/portfolio"
              className="hover:text-[#E90046] transition-colors font-medium"
            >
              {isMarathi ? 'डिझाईन पोर्टफोलिओ' : 'Design Portfolio'}
            </Link>

            {/* Business Solutions */}
            <button
              onClick={onOpenQuote}
              className="hover:text-[#E90046] transition-colors font-medium cursor-pointer"
            >
              {isMarathi ? 'बिझनेस सोल्यूशन्स' : 'Business Solutions'}
            </button>

            {/* About Us */}
            <a
              href="#about"
              onClick={(e) => {
                const el = document.getElementById('about');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-[#E90046] transition-colors font-medium"
            >
              {isMarathi ? 'आमच्याबद्दल' : 'About Us'}
            </a>

            {/* Support */}
            <button
              onClick={onOpenTrackOrder}
              className="hover:text-[#E90046] transition-colors font-medium cursor-pointer"
            >
              {isMarathi ? 'सपोर्ट' : 'Support'}
            </button>

          </nav>

          {/* Far Right: WhatsApp Us */}
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#25D366] hover:text-[#1ebd59] transition-colors cursor-pointer shrink-0"
            aria-label="WhatsApp Us"
          >
            <svg 
              className="w-4 h-4 fill-current" 
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.546 1.764.82 2.796.82 3.18 0 5.767-2.586 5.767-5.766.001-3.182-2.585-5.768-5.767-5.768zm0 10.455c-.908 0-1.748-.255-2.51-.707l-.18-.107-1.574.413.42-.1.534-.14-1.536.403.42-1.535-.118-.188c-.496-.79-.758-1.545-.758-2.33 0-2.583 2.102-4.685 4.686-4.685 2.583 0 4.685 2.102 4.685 4.685 0 2.584-2.102 4.685 4.685 4.685zm3.327-3.513c-.182-.091-1.077-.532-1.244-.593-.167-.061-.288-.091-.41.091-.121.182-.471.593-.577.714-.107.121-.213.137-.395.046-.182-.091-.77-.284-1.467-.905-.542-.483-.908-1.08-1.015-1.262-.106-.182-.011-.281.08-.371.082-.082.182-.213.274-.319.091-.107.122-.182.182-.304.061-.122.03-.228-.015-.319-.046-.091-.41-1-.562-1.37-.152-.37-.306-.319-.41-.324h-.35c-.121 0-.319.046-.486.228-.167.182-.639.624-.639 1.521 0 .897.654 1.764.745 1.885.091.122 1.287 1.965 3.118 2.755 1.831.79 1.831.527 2.165.496.334-.03 1.077-.44 1.229-.865.152-.426.152-.791.106-.866-.046-.076-.167-.122-.349-.213z"/>
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.986l-1.413 5.163 5.302-1.391c1.455.795 3.097 1.218 4.771 1.218 5.507 0 9.99-4.478 9.99-9.984 0-5.506-4.483-9.976-9.99-9.976zm0 18.293c-1.554 0-3.076-.418-4.402-1.209l-.316-.188-3.146.825.84-3.067-.206-.328c-.868-1.381-1.326-2.986-1.326-4.642 0-4.577 3.724-8.301 8.301-8.301 4.576 0 8.3 3.724 8.3 8.301 0 4.577-3.724 8.309-8.301 8.309z"/>
            </svg>
            <span>WhatsApp Us</span>
          </button>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE NAVIGATION DRAWER (Slide-over sheet)                  */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-[#080D1C] text-white h-full shadow-2xl z-50 flex flex-col justify-between overflow-y-auto p-5 border-r border-slate-800">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <ProprintLogo size="sm" variant="light" showTagline={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Language / भाषा:</span>
                <div className="flex items-center bg-black/40 border border-slate-700 rounded-full p-0.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${language === 'en' ? 'bg-[#E90046] text-white' : 'text-slate-400'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('mr')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${language === 'mr' ? 'bg-[#E90046] text-white' : 'text-slate-400'}`}
                  >
                    मराठी
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-sm font-medium">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  All Products
                </Link>
                <Link
                  to="/products?category=visiting-cards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  Visiting Cards
                </Link>
                <Link
                  to="/products?category=packaging"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  Packaging Boxes
                </Link>
                <Link
                  to="/products?category=brochures"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  Flyers & Brochures
                </Link>
                <Link
                  to="/portfolio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  Design Portfolio
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  My Orders
                </Link>
                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#E90046] hover:bg-[#d0003e] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Get a Free Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWhatsApp();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-4">
              <p className="font-semibold text-white">Proprint Printing Solutions</p>
              <p>support@proprint.in • +91 93212 00095</p>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Global Loading Line */}
      {isGlobalLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100 overflow-hidden z-50">
          <div className="h-full bg-gradient-to-r from-[#E90046] via-[#FF0038] to-[#E90046] animate-pulse" />
        </div>
      )}

    </header>
  );
};
