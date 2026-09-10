import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  Package, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { RealTimeOrderStatusTracker } from './RealTimeOrderStatusTracker';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber
}) => {
  const { orders, isMarathi } = useApp();
  const [searchCode, setSearchCode] = useState(initialOrderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    orders.find(o => o.orderNumber === initialOrderNumber) || orders[0] || null
  );
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setSearching(true);
    setNotFound(false);

    const clean = searchCode.trim().toLowerCase().replace('#', '');

    // 1. Check local state orders first
    const localFound = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(clean) ||
        o.id.toLowerCase().includes(clean) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(clean)) ||
        (o.customerPhone && o.customerPhone.includes(clean))
    );

    if (localFound) {
      setSelectedOrder(localFound);
      setNotFound(false);
      setSearching(false);
      return;
    }

    // 2. Fetch from live backend order database
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setNotFound(false);
      } else {
        setSelectedOrder(null);
        setNotFound(true);
      }
    } catch (_err) {
      setSelectedOrder(null);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-marathi"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto text-slate-900 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search & Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600/30 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
              <Truck className="w-3 h-3" />
              <span>{isMarathi ? 'थेट ऑर्डर ट्रॅकिंग' : 'Real-Time Order Tracker'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {isMarathi ? 'तुमची प्रिंटिंग ऑर्डर ट्रॅक करा' : 'Live Order Status & Stage'}
            </h2>
            <p className="text-xs text-slate-300">
              {isMarathi ? 'ऑर्डर क्रमांक किंवा कुरिअर डॉकेट नंबर टाकून थेट प्रगती तपासा.' : 'Enter your Order # or Docket tracking number to view step-by-step progress.'}
            </p>
          </div>

          {/* Quick search input */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={isMarathi ? 'उदा. PRP-1001 किंवा ९३२२१२६८६३' : 'e.g. PRP-1001, EXP-IN-..., or Phone'}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-[#FF0038] hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {searching ? (isMarathi ? 'शोधत आहे...' : 'Tracking...') : (isMarathi ? 'ट्रॅक करा' : 'Track Order')}
            </button>
          </form>

          {/* Quick Select Buttons from user recent orders */}
          {orders.length > 1 && (
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400">
              <span className="shrink-0 text-[10px] uppercase font-bold text-slate-500">
                {isMarathi ? 'अलीकडील ऑर्डर्स:' : 'Recent:'}
              </span>
              {orders.slice(0, 4).map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrder(o);
                    setSearchCode(o.orderNumber);
                    setNotFound(false);
                  }}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-colors shrink-0 cursor-pointer ${
                    selectedOrder?.id === o.id 
                      ? 'bg-rose-500 text-white font-bold' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  #{o.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body with RealTimeOrderStatusTracker */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50">
          {notFound ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                {isMarathi ? 'ऑर्डर सापडली नाही' : 'No Matching Order Found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isMarathi 
                  ? 'कृपया ऑर्डर नंबर किंवा मोबाईल नंबर तपासा आणि पुन्हा प्रयत्न करा.' 
                  : 'Please check your Order Number or Phone number and try again.'}
              </p>
            </div>
          ) : selectedOrder ? (
            <RealTimeOrderStatusTracker 
              order={selectedOrder}
              autoPoll={true}
              pollIntervalMs={8000}
              showActions={true}
              className="border-0 shadow-none"
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              {isMarathi ? 'कृपया ट्रॅक करण्यासाठी ऑर्डर नंबर टाका.' : 'Enter an Order Number to view live progress.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
