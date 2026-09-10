import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Truck, 
  Printer, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RealTimeOrderStatusTracker } from '../components/RealTimeOrderStatusTracker';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('order') || '';
  const { orders, isMarathi } = useApp();

  const [inputCode, setInputCode] = useState(initialId);
  const [activeTrackingId, setActiveTrackingId] = useState(
    initialId || orders[0]?.orderNumber || ''
  );

  useEffect(() => {
    if (initialId) {
      setInputCode(initialId);
      setActiveTrackingId(initialId);
    } else if (orders.length > 0 && !activeTrackingId) {
      setActiveTrackingId(orders[0].orderNumber);
      setInputCode(orders[0].orderNumber);
    }
  }, [initialId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim();
    setActiveTrackingId(clean);
    setSearchParams({ id: clean });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 font-marathi">
      
      {/* 1. BREADCRUMB NAVIGATION */}
      <Breadcrumbs
        items={[
          { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', to: '/' },
          { label: isMarathi ? 'माझ्या ऑर्डर्स' : 'My Orders', to: '/orders' },
          { label: isMarathi ? 'थेट ट्रॅकिंग' : 'Real-Time Order Tracking', active: true }
        ]}
      />

      {/* 2. PAGE HEADER & SEARCH BAR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>{isMarathi ? 'लाईव्ह मॅन्युफॅक्चरिंग ट्रॅकिंग' : 'Live Production & Dispatch Tracking'}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isMarathi ? 'तुमची प्रिंट ऑर्डर ट्रॅक करा' : 'Track Your Print Job in Real-Time'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            {isMarathi 
              ? 'ऑर्डर नंबर (उदा. PRP-1001) किंवा मोबाईल नंबर टाकून प्रिंटिंग, गुणवत्ता तपासणी व डिलिव्हरीची थेट स्थिती पहा.' 
              : 'Enter your Order # or Docket tracking number to view step-by-step progress from Offset Press to Delivery.'}
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={isMarathi ? 'उदा. PRP-1001 किंवा ९३२२१२६८६३' : 'e.g. PRP-1001, EXP-IN-..., or Phone'}
              className="w-full pl-10 pr-3 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-sans"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FF0038] hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            {isMarathi ? 'ऑर्डर ट्रॅक करा' : 'Track Order'}
          </button>
        </form>

        {/* Quick Recent order pills */}
        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="text-[11px] font-bold text-slate-400">
              {isMarathi ? 'माझ्या ऑर्डर्स:' : 'Your Orders:'}
            </span>
            {orders.slice(0, 4).map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setInputCode(o.orderNumber);
                  setActiveTrackingId(o.orderNumber);
                  setSearchParams({ id: o.orderNumber });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeTrackingId.toLowerCase() === o.orderNumber.toLowerCase()
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                #{o.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. REAL-TIME TRACKING COMPONENT */}
      {activeTrackingId ? (
        <RealTimeOrderStatusTracker
          orderIdOrNumber={activeTrackingId}
          autoPoll={true}
          pollIntervalMs={7000}
          showActions={true}
        />
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 space-y-3">
          <Truck className="w-10 h-10 mx-auto text-slate-400" />
          <p className="text-sm font-bold text-slate-700">
            {isMarathi ? 'कोणतीही ऑर्डर निवडलेली नाही' : 'Enter an Order Number above to track its live stage'}
          </p>
        </div>
      )}

      {/* 4. PRODUCTION PROCESS GUIDE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF0038]" />
          <span>{isMarathi ? 'आमची गुणवत्ता व प्रिंटिंग प्रक्रिया' : 'Commercial Print Workflow Explained'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">In Printing</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isMarathi 
                ? 'हेडेलबर्ग स्पीडमास्टर 4-कलर प्रेसवर अचूक सीएमवायके प्रोफाइलसह प्रत्यक्ष प्रिंटिंग.' 
                : 'High-speed Heidelberg 4-color offset press running verified CMYK ink density.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Quality Check</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isMarathi 
                ? 'थर्मल वेलव्हेट लॅमिनेशन, यूव्ही कोटिंग आणि हायड्रॉलिक कटिंग अचूकतेची तपासणी.' 
                : 'Thermal velvet/matte lamination, UV curing and precision edge trimming inspect.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Dispatched</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isMarathi 
                ? 'वॉटरप्रूफ श्रिंक-रॅप पॅकिंग व थेट एक्स्प्रेस कुरिअर ट्रॅकिंग डॉकेट जारी.' 
                : 'Moisture-proof shrink wrap packing with live express logistics docket code.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
