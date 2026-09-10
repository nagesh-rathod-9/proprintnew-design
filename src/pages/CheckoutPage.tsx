import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Lock,
  UploadCloud,
  FileArchive,
  Image as ImageIcon,
  Check,
  X,
  Smartphone,
  Sparkles,
  PackageCheck,
  Printer
} from 'lucide-react';
import { useApp, apiFetch, getFullImageUrl } from '../context/AppContext';
import { triggerOrderConfetti } from '../utils/confetti';
import { CashfreePaymentModal, CashfreePaymentResult } from '../components/CashfreePaymentModal';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, cartTax, cartTotal, placeOrder, currentUser, isMarathi, showToast, addUserAddress } = useApp();
  const navigate = useNavigate();
  const isOrderPlacedRef = useRef(false);

  React.useEffect(() => {
    // If order has just been placed and we are routing to /orders, do NOT redirect to /cart
    if (isOrderPlacedRef.current) return;

    if (!currentUser) {
      navigate('/login?redirect=/checkout');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [currentUser, cart.length, navigate]);

  const userAddresses = currentUser?.addresses || [];
  const hasSavedAddresses = userAddresses.length > 0;
  const defaultAddr = hasSavedAddresses ? (userAddresses.find(a => a.isDefault) || userAddresses[0]) : null;

  // Selected Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddr?.id || null);

  // Form Fields - Only populate from saved address if the user actually has saved addresses, otherwise show empty fields!
  const [fullName, setFullName] = useState(defaultAddr?.name || currentUser?.name || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [companyName, setCompanyName] = useState(defaultAddr?.companyName || '');
  const [gstin, setGstin] = useState(defaultAddr?.gstNumber || '');
  const [address, setAddress] = useState(defaultAddr?.addressLine || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');
  const [paymentOption, setPaymentOption] = useState<'cashfree' | 'verify_pay' | 'upi_direct'>('verify_pay');
  const [deliveryOption, setDeliveryOption] = useState<'express' | 'pickup'>('express');
  const [specialNotes, setSpecialNotes] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);

  // When user clicks a saved address
  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    if (addr.name) setFullName(addr.name);
    if (addr.phone) setPhone(addr.phone);
    if (addr.companyName) setCompanyName(addr.companyName);
    if (addr.gstNumber) setGstin(addr.gstNumber);
    if (addr.addressLine) setAddress(addr.addressLine);
    if (addr.city) setCity(addr.city);
    if (addr.pincode) setPincode(addr.pincode);
    showToast(`Loaded ${addr.label} address`, 'info');
  };

  // When user clicks Enter New Address
  const handleEnterNewAddress = () => {
    setSelectedAddressId(null);
    setCompanyName('');
    setGstin('');
    setAddress('');
    setCity('');
    setPincode('');
    showToast('Switched to new address fields', 'info');
  };
  
  // Cashfree Modal State
  const [isCashfreeOpen, setIsCashfreeOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);

  // File Upload State (IMG, ZIP, PDF, CDR, etc.)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | undefined>(undefined);
  const [uploadedIsImage, setUploadedIsImage] = useState<boolean>(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Placed Order Success Screen & Redirecting State
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderNumber: string;
    total: number;
    itemCount: number;
    paymentMethod: string;
    customerName: string;
    items?: any[];
  } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [redirectProgress, setRedirectProgress] = useState(0);

  // Automated Smooth Countdown & Progress Bar to /orders
  useEffect(() => {
    if (!placedOrderInfo) return;

    // Smooth progress bar filling to 100% over 3000ms
    const progressInterval = setInterval(() => {
      setRedirectProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // 1-second countdown interval
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          navigate('/orders', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
    };
  }, [placedOrderInfo, navigate]);

  const handleImmediateRedirect = () => {
    navigate('/orders', { replace: true });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    const isImg = file.type.startsWith('image/');
    setUploadedIsImage(isImg);

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setUploadedPreviewUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedPreviewUrl(null);
    }

    // Upload to Express Backend /api/upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.file) {
        setUploadedFileUrl(getFullImageUrl(data.file.url));
        setUploadedIsImage(data.file.isImage);
      }
    } catch (err) {
      console.warn('File upload fallback:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileName(null);
    setUploadedFileUrl(null);
    setUploadedPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return false;
    }
    if (!address.trim()) {
      showToast('Please enter your delivery street address', 'error');
      return false;
    }
    if (!city.trim()) {
      showToast('Please enter your city', 'error');
      return false;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit PIN code', 'error');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentOption === 'cashfree') {
      // Open Cashfree Gateway Modal
      setIsCashfreeOpen(true);
      return;
    }

    // Non-Cashfree or Zero Upfront flow
    executeOrderPlacement('Pay on Artwork Verification');
  };

  const executeOrderPlacement = (paymentMethodString: string, cashfreeTxnId?: string) => {
    isOrderPlacedRef.current = true;
    setIsSubmitting(true);
    try {
      const order = placeOrder({
        fullName,
        phone,
        email,
        companyName,
        gstin,
        address,
        city,
        pincode,
        paymentMethod: paymentMethodString,
        deliveryOption,
        specialNotes: cashfreeTxnId ? `${specialNotes} | Cashfree Txn: ${cashfreeTxnId}` : specialNotes,
        uploadedFileUrl,
        uploadedFileName,
        uploadedFileSize,
        uploadedFileType: uploadedFile?.type,
        uploadedIsImage
      });

      showToast('Order confirmed! Generating job slip...', 'success');
      triggerOrderConfetti();
      setPlacedOrderInfo({
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items?.length || cart.length || 1,
        paymentMethod: paymentMethodString,
        customerName: fullName || order.customerName,
        items: order.items || cart
      });
      setCountdown(3);
      setRedirectProgress(0);
    } catch (err) {
      isOrderPlacedRef.current = false;
      console.error('Order submission error:', err);
      showToast('Failed to process order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setIsCashfreeOpen(false);
    }
  };

  const handleCashfreeSuccess = (result: CashfreePaymentResult) => {
    executeOrderPlacement(`Cashfree PG (${result.paymentMode})`, result.transactionId);
  };

  if (!isOrderPlacedRef.current && (!currentUser || cart.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-marathi">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">
          {!currentUser ? 'Redirecting to login...' : 'Redirecting to cart...'}
        </p>
      </div>
    );
  }

  // Production-Grade Order Placed & Redirecting State
  if (placedOrderInfo || isOrderPlacedRef.current) {
    const orderNum = placedOrderInfo?.orderNumber || 'PRO-JOB';
    const totalAmount = placedOrderInfo?.total ?? cartTotal;
    const itemsCount = placedOrderInfo?.itemCount ?? (cart.length || 1);
    const payMethod = placedOrderInfo?.paymentMethod || 'Cashfree / Verified';
    const custName = placedOrderInfo?.customerName || fullName || 'Valued Client';

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-3 sm:px-4 py-8 font-marathi">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Subtle top decorative bar in Proprint brand gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-rose-600 to-amber-500"></div>

          {/* Animated Success Badge with soft pulse ring */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30"></div>
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          {/* Title & Status */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'पेमेंट व्हेरिफाइड • ऑर्डर निश्चित' : 'Payment Verified • Order Placed'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isMarathi ? 'ऑर्डर यशस्वीरीत्या नोंदवली गेली!' : 'Order Placed Successfully!'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isMarathi 
                ? 'तुमची प्रिंटिंग ऑर्डर फॅक्टरी वर्कफ्लोमध्ये समाविष्ट झाली आहे. जॉब स्लिप तयार होत आहे.' 
                : 'Your commercial print job has been queued in our press workflow. Pre-flight verification in progress.'}
            </p>
          </div>

          {/* Order Details Snapshot Card */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isMarathi ? 'ऑर्डर नंबर' : 'Order Reference'}
              </span>
              <span className="font-mono font-black text-rose-600 text-base sm:text-lg">
                #{orderNum}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">{isMarathi ? 'एकूण रक्कम' : 'Total Amount'}</span>
                <span className="font-bold text-slate-900 text-sm">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">{isMarathi ? 'पेमेंट पद्धत' : 'Payment Method'}</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{payMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">{isMarathi ? 'प्रिंट जॉब्स' : 'Items'}</span>
                <span className="font-semibold text-slate-800">{itemsCount} {isMarathi ? 'आयटम' : 'Print Job(s)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">{isMarathi ? 'ग्राहक' : 'Customer'}</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{custName}</span>
              </div>
            </div>
          </div>

          {/* Redirecting Progress & Countdown */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>{isMarathi ? 'ऑर्डर इतिहास व ट्रॅकिंगवर रीडायरेक्ट करत आहोत...' : 'Redirecting to your orders...'}</span>
              </span>
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {countdown}s
              </span>
            </div>

            {/* Smooth Fill Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className="bg-rose-600 h-full rounded-full transition-all duration-100 ease-out"
                style={{ width: `${redirectProgress}%` }}
              ></div>
            </div>

            {/* Micro steps indicator */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Check className="w-3 h-3 stroke-[3]" /> {isMarathi ? 'पेमेंट व्हेरिफाइड' : 'Payment Verified'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Check className="w-3 h-3 stroke-[3]" /> {isMarathi ? 'जॉब स्लिप तयार' : 'Job Slip Created'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <PackageCheck className="w-3.5 h-3.5 text-rose-600" /> {isMarathi ? 'माझ्या ऑर्डर्स' : 'My Orders'}
              </span>
            </div>
          </div>

          {/* Action Button to Skip Countdown Immediately */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleImmediateRedirect}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 hover:shadow-xl hover:shadow-rose-600/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>{isMarathi ? 'आत्ताच माझ्या ऑर्डर्स उघडा' : 'View My Orders Now'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Trust footer note */}
          <p className="text-[11px] text-slate-400 pt-1">
            {isMarathi 
              ? 'प्रॉप्रिंट फॅक्टरी • छत्रपती संभाजीनगर • व्हॉट्सॲप असिस्टन्स: ९३२२१२६८६३' 
              : 'Proprint Factory Hub • Chhatrapati Sambhajinagar • Instant WhatsApp Support'}
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8 py-6 space-y-6 font-marathi">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1.5">
          <Breadcrumbs
            items={[
              { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', to: '/' },
              { label: isMarathi ? 'प्रिंटिंग कार्ट' : 'Cart', to: '/cart' },
              { label: isMarathi ? 'ऑर्डर चेकआऊट' : 'Checkout', active: true }
            ]}
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {isMarathi ? 'ऑर्डर चेकआऊट व बिलिंग' : 'Checkout & Print Order Confirmation'}
          </h1>
          <p className="text-xs text-slate-500">
            {isMarathi ? 'अचूक पत्ता आणि संपर्क माहिती भरा. आम्ही डिझाईन प्रुफ त्वरित तपासू.' : 'Complete your shipping information and choose your preferred payment mode.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Fields (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Contact & Billing Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                <span>{isMarathi ? 'ग्राहक व पत्ता माहिती' : 'Contact & Shipping Address'}</span>
              </h2>
              {userAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  {isMarathi ? 'पत्ते व्यवस्थापित करा' : 'Manage Addresses'} ↗
                </button>
              )}
            </div>

            {/* Saved Addresses Quick Selector */}
            {userAddresses.length > 0 && (
              <div className="space-y-1.5 pt-1 pb-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {isMarathi ? 'जतन केलेला पत्ता निवडा' : 'Select Saved Delivery Address'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {userAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-50/60 border-rose-500 ring-1 ring-rose-500/30'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                            {addr.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{addr.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{addr.addressLine}, {addr.city}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">+91 {addr.phone} • PIN: {addr.pincode}</p>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleEnterNewAddress}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-center items-center text-center gap-1 ${
                      selectedAddressId === null
                        ? 'bg-rose-50/60 border-rose-500 ring-1 ring-rose-500/30 text-rose-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold">+ {isMarathi ? 'नवीन पत्ता भरा' : 'Enter New Address'}</span>
                    <span className="text-[10px] text-slate-500">{isMarathi ? 'खालील रकाने रिकामे करा' : 'Clear & enter manually'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'पूर्ण नाव *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'मोबाईल नंबर (WhatsApp) *' : 'Mobile Number (WhatsApp) *'}</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9822000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'ईमेल पत्ता' : 'Email Address'}</label>
                <input
                  type="email"
                  placeholder="e.g. client@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'कंपनी / फर्म नाव (पर्यायी)' : 'Business / Firm Name'}</label>
                <input
                  type="text"
                  placeholder="e.g. Patil Enterprises"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'डिलिव्हरी पत्ता *' : 'Street Address & Landmark *'}</label>
                <input
                  type="text"
                  required
                  placeholder="Door/Shop No, Building Name, Street / Industrial Area, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'शहर / गाव *' : 'City / Town *'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chhatrapati Sambhajinagar, Pune, Mumbai..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'पिनकोड *' : 'PIN Code *'}</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 431001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700 block text-[11px]">{isMarathi ? 'GSTIN (GST इनव्हॉइससाठी)' : 'GSTIN (For 18% Input Tax Credit)'}</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AXXXX1234X1Z0 (Optional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Option */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <span>{isMarathi ? 'डिलिव्हरी पद्धत' : 'Delivery Method'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div
                onClick={() => setDeliveryOption('express')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  deliveryOption === 'express'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{isMarathi ? 'एक्स्प्रेस कुरिअर डिलिव्हरी' : 'Express Courier Dispatch'}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{isMarathi ? '२४-४८ तासांत सुरक्षित पॅकेजिंग' : 'Direct courier dispatch across Maharashtra & India.'}</p>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Free Shipping Included</span>
                </div>
              </div>

              <div
                onClick={() => setDeliveryOption('pickup')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  deliveryOption === 'pickup'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{isMarathi ? 'कारखान्यातून थेट पिकअप' : 'Press Counter Pick-up'}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Sushila Arcade, Motikaranja, Chh. Sambhajinagar</p>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Zero Wait Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Upload Artwork / Design Files */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                <span>{isMarathi ? 'डिझाईन / इमेज / ZIP फाईल' : 'Upload Design / Artwork / ZIP (Optional)'}</span>
              </h2>
              <span className="text-[10px] text-slate-500">Supports CDR, PDF, ZIP, PNG, JPG</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.webp,.svg,.zip,.rar,.7z,.pdf,.cdr,.ai,.psd"
              className="hidden"
            />

            {uploadedFileName ? (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {uploadedPreviewUrl ? (
                    <img 
                      src={uploadedPreviewUrl} 
                      alt="Order attachment" 
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-400 shrink-0 bg-white" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                      <FileArchive className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-slate-900 truncate block">{uploadedFileName}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {uploadedFileSize ? `${Math.round(uploadedFileSize / 1024)} KB` : 'Attached'} • Ready for pre-press verification
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isUploading ? 'bg-rose-50/50 border-rose-400' : 'bg-slate-50 hover:bg-rose-50/30 border-slate-300 hover:border-rose-500'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-rose-700">
                    <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">Uploading file to server...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <UploadCloud className="w-5 h-5 text-rose-600" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">
                        {isMarathi ? 'प्रिंट डिझाईन फाईल अपलोड करा' : 'Click to Upload Artwork or ZIP File'}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        You can also share files directly on WhatsApp after ordering
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Payment Option Selection (Featuring Cashfree) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
              <span>{isMarathi ? 'पेमेंट पर्याय निवडा' : 'Payment Method'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Option A: Cashfree Payments (Primary) */}
              <div
                onClick={() => setPaymentOption('cashfree')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentOption === 'cashfree'
                    ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0D1527] text-cyan-400 flex items-center justify-center font-black text-xs shrink-0">
                  CF
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs">Cashfree Payments (Instant)</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking with 256-Bit SSL protection.
                  </p>
                </div>
              </div>

              {/* Option B: Pay on Artwork Approval */}
              <div
                onClick={() => setPaymentOption('verify_pay')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentOption === 'verify_pay'
                    ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-xs">Pay on Artwork Approval</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Zero upfront payment. Pay after our printing manager reviews and confirms your proofs on WhatsApp.
                  </p>
                </div>
              </div>

            </div>

            <div className="space-y-1 pt-1 text-xs">
              <label className="font-semibold text-slate-700 block text-[11px]">
                {isMarathi ? 'विशेष सूचना / कस्टम नोट्स (पर्यायी)' : 'Special Instructions / Press Notes (Optional)'}
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Please send CMYK proof on WhatsApp before running offset batch..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 sticky top-20">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider">
            {isMarathi ? 'अंतिम ऑर्डर सारांश' : 'Order Breakdown'}
          </h2>

          <div className="space-y-2 text-xs text-slate-600 max-h-56 overflow-y-auto">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between py-1 border-b border-slate-100 gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 truncate block">{item.product.name}</span>
                  <span className="text-[10px] text-slate-500">Qty: {item.customization.quantity} {item.product.unit}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0 font-mono">₹{item.customization.calculatedPrice}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Invoiced):</span>
              <span className="font-mono font-bold text-slate-900">₹{cartTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Courier Delivery:</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-lg font-black text-rose-600 font-mono">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Processing...' 
                : paymentOption === 'cashfree' 
                  ? `Pay ₹${cartTotal.toLocaleString('en-IN')} with Cashfree`
                  : 'Confirm Order & Send to Press'}
            </span>
          </button>

          <div className="text-center text-[10px] text-slate-400 space-y-1">
            <p>🛡️ Verified Merchant • GST Tax Invoiced</p>
            <p>Direct Press In-house Dispatch within 24-48 Hours</p>
          </div>

        </div>

      </form>

      {/* Cashfree Payment Gateway Simulation Modal */}
      <CashfreePaymentModal
        isOpen={isCashfreeOpen}
        onClose={() => setIsCashfreeOpen(false)}
        amount={cartTotal}
        customerName={fullName || 'Commercial Client'}
        customerPhone={phone || '9322126863'}
        customerEmail={email || 'client@proprint.in'}
        onPaymentSuccess={handleCashfreeSuccess}
      />

    </div>
  );
};
