import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Plus,
  Minus,
  Sparkles,
  Tag,
  FileCheck2,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    cartSubtotal, 
    cartTax, 
    cartTotal, 
    isMarathi, 
    currentUser,
    showToast 
  } = useApp();

  const navigate = useNavigate();
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      navigate('/login?redirect=' + encodeURIComponent('/checkout'));
    } else {
      navigate('/checkout');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponInput('');
    }
  };

  const handleClearCart = () => {
    clearCart();
    setIsConfirmingClear(false);
    showToast(isMarathi ? 'कार्ट रिकामे केले आहे' : 'Cart has been cleared', 'info');
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 font-marathi space-y-4">
        {/* Clickable Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', to: '/' },
            { label: isMarathi ? 'सर्व उत्पादने' : 'All Products', to: '/products' },
            { label: isMarathi ? 'प्रिंटिंग कार्ट' : 'Cart', active: true }
          ]}
        />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center space-y-5">
          <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto">
            <ShoppingCart className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isMarathi ? 'तुमचे प्रिंटिंग कार्ट रिकामे आहे' : 'Your Commercial Print Cart is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isMarathi 
                ? 'विझिटिंग कार्ड्स, ब्रोशर्स, स्टिकर्स किंवा पॅकेजिंग उत्पादने निवडा आणि आपल्या आवडीनुसार आकार, फिनिश आणि संख्या ठरवा.' 
                : 'Browse through our commercial offset printing catalog to configure custom visiting cards, brochures, banners, stickers and boxes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <span>{isMarathi ? 'सर्व उत्पादने पहा' : 'Browse All Products'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/visiting-cards"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>{isMarathi ? 'विझिटिंग कार्ड स्टुडिओ' : 'Visiting Card Studio'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Raw total calculation
  const rawItemsTotal = cart.reduce((acc, item) => acc + (item.subtotal || item.customization?.calculatedPrice || 0), 0);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8 py-6 sm:py-8 space-y-6 font-marathi">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1.5">
          <Breadcrumbs
            items={[
              { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', to: '/' },
              { label: isMarathi ? 'सर्व उत्पादने' : 'All Products', to: '/products' },
              { label: isMarathi ? 'प्रिंटिंग कार्ट' : 'Cart', active: true }
            ]}
          />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isMarathi ? 'प्रिंटिंग कार्ट' : 'Commercial Print Cart'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold">
              {cart.length} {cart.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </h1>
          <p className="text-[11px] text-slate-500">
            {isMarathi ? 'आपल्या सर्व सक्रिय प्रिंटिंग ऑर्डर्सची यादी' : 'Review your customized print jobs and dispatch options'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 transition-all font-bold text-xs shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-rose-600" />
            <span>{isMarathi ? 'आणखी उत्पादने जोडा' : 'Add More Products'}</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Items on Left (2 cols), Order Summary on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const product = item?.product;
            const productName = isMarathi && product?.nameMr ? product.nameMr : (product?.name || 'Custom Print Job');
            const productImage = product?.image || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80';
            const unit = product?.unit || 'units';
            const currentQty = item?.customization?.quantity || 1;
            const itemPrice = item?.subtotal || item?.customization?.calculatedPrice || 0;
            const unitRate = currentQty > 0 ? (itemPrice / currentQty).toFixed(2) : '0.00';

            return (
              <div
                key={item.id || `cart-item-${idx}`}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  
                  {/* Left: Thumbnail & Main Specs */}
                  <div className="flex items-start gap-3.5 sm:gap-4 w-full sm:w-auto">
                    <Link to={`/product/${product?.id}`} className="shrink-0 group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {product?.category && (
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-slate-900/80 text-white px-1 py-0.5 rounded text-center truncate backdrop-blur-xs">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Link 
                        to={`/product/${product?.id}`}
                        className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-rose-600 transition-colors line-clamp-1"
                      >
                        {productName}
                      </Link>

                      {/* Customization Details Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                        {item?.customization?.finishId && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 border border-slate-200/60">
                            {item.customization.finishId}
                          </span>
                        )}
                        {item?.customization?.sizeId && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 border border-slate-200/60">
                            {item.customization.sizeId}
                          </span>
                        )}
                        {item?.customization?.corners && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 border border-slate-200/60">
                            {item.customization.corners}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item?.customization?.turnaroundDays || '1-2'} Days Dispatch</span>
                        </span>
                      </div>

                      {/* Uploaded Artwork Badge */}
                      {item?.customization?.uploadedFileName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/80 border border-indigo-200/70 px-2.5 py-1 rounded-lg w-fit mt-1">
                          <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                          <span className="font-semibold truncate max-w-[200px] sm:max-w-[260px]">
                            {item.customization.uploadedFileName}
                          </span>
                          {item?.customization?.uploadedFileSize && (
                            <span className="text-[10px] text-indigo-500 font-mono">
                              ({(item.customization.uploadedFileSize / (1024 * 1024)).toFixed(1)}MB)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Special Notes if provided */}
                      {item?.customization?.specialInstructions && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1 pt-0.5">
                          Note: "{item.customization.specialInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Price Calculation */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Price & Unit Rate */}
                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        ₹{itemPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        ₹{unitRate} / {unit.slice(0, 4)}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            const step = currentQty > 500 ? 500 : currentQty > 100 ? 100 : 50;
                            const newQ = Math.max(50, currentQty - step);
                            updateCartQuantity(item.id, newQ);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="px-2.5 py-1 text-xs font-bold text-slate-800 min-w-[50px] text-center bg-white">
                          {currentQty} {unit.slice(0, 3)}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const step = currentQty >= 500 ? 500 : currentQty >= 100 ? 100 : 50;
                            const newQ = currentQty + step;
                            updateCartQuantity(item.id, newQ);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={isMarathi ? 'कार्टमधून काढा' : 'Remove item'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}

          {/* Cart Bottom Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'खरेदी सुरू ठेवा / आणखी जोडा' : 'Continue Shopping / Add More'}</span>
            </Link>

            {/* Clear Cart with Confirmation */}
            {isConfirmingClear ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-rose-700">
                  {isMarathi ? 'नक्की सर्व काढावे?' : 'Clear all items?'}
                </span>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                >
                  {isMarathi ? 'होय, काढा' : 'Yes, Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  {isMarathi ? 'रद्द' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'संपूर्ण कार्ट रिकामे करा' : 'Clear Entire Cart'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Checkout Summary */}
        <div className="lg:sticky lg:top-24 space-y-4">
          
          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                {isMarathi ? 'ऑर्डर सारांश' : 'Order Summary'}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {cart.length} {cart.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>

            {/* Price Line Items */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>{isMarathi ? 'उप-रक्कम (Subtotal)' : 'Items Subtotal'}</span>
                <span className="font-bold text-slate-800 text-sm">
                  ₹{rawItemsTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Promo Code / Discount */}
              {appliedCoupon && discountAmount > 0 ? (
                <div className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/60">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon})</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[10px] text-rose-600 hover:underline ml-1 cursor-pointer font-normal"
                    >
                      (Remove)
                    </button>
                  </div>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>{isMarathi ? 'जीएसटी (१८% कर इनव्हॉइस)' : 'GST (18% Tax Invoice)'}</span>
                </span>
                <span className="font-bold text-slate-800">
                  ₹{cartTax.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 font-bold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'एक्सप्रेस कूरियर' : 'Express Delivery'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase">
                  FREE
                </span>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {isMarathi ? 'एकूण देय रक्कम' : 'Estimated Total'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isMarathi ? 'सर्व कर समाविष्ट' : 'All taxes & delivery included'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600 tracking-tight">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Application Box */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isMarathi ? 'कूपन किंवा प्रोमो कोड' : 'Have a Promo Code?'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. NEWUSER"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono placeholder:normal-case focus:outline-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isMarathi ? 'लागू करा' : 'Apply'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Use <span className="font-mono font-bold text-rose-600">NEWUSER</span> for 50% initial press discount.
              </p>
            </form>

            {/* Primary Proceed to Checkout Button */}
            <button
              type="button"
              id="proceed-to-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
            >
              <span>{isMarathi ? 'चेकआऊट सुरू करा' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* WhatsApp Quick Order Inquiry */}
            <div className="pt-1 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 py-1 w-full"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>{isMarathi ? 'व्हॉट्सॲपवरून थेट चौकशी करा' : 'Quick Assistance via WhatsApp Press Desk'}</span>
              </button>
            </div>

          </div>

          {/* Quality & Security Trust Badges */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isMarathi ? '१००% गुणवत्ता हमी' : 'Proprint Offset Press Guarantee'}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-500 pl-6 list-disc">
              <li>Heidelberg 4-Color CTP Ultra Sharp Printing</li>
              <li>Free File Preflight & Bleed Inspection</li>
              <li>Safe UPI, NetBanking & Cashfree Payments</li>
              <li>Factory Dispatches from Chhatrapati Sambhajinagar</li>
            </ul>
          </div>

        </div>

      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultMessage={`Hello Proprint! I have ${cart.length} items in my commercial cart (Total: ₹${cartTotal}). Please connect regarding proof approval and dispatch schedule.`}
      />

    </div>
  );
};
