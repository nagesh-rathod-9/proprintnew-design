import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Printer, 
  ShieldCheck, 
  Truck, 
  PackageCheck, 
  Layers, 
  RotateCw, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Phone, 
  FileText, 
  Sparkles,
  AlertCircle,
  MessageSquare,
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Order, OrderTrackStep } from '../types';
import { useApp } from '../context/AppContext';

export interface RealTimeOrderStatusTrackerProps {
  order?: Order | null;
  orderIdOrNumber?: string;
  autoPoll?: boolean;
  pollIntervalMs?: number;
  compact?: boolean;
  showActions?: boolean;
  onClose?: () => void;
  className?: string;
}

export const RealTimeOrderStatusTracker: React.FC<RealTimeOrderStatusTrackerProps> = ({
  order: initialOrder,
  orderIdOrNumber,
  autoPoll = true,
  pollIntervalMs = 10000,
  compact = false,
  showActions = true,
  onClose,
  className = ''
}) => {
  const { isMarathi, showToast } = useApp();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderIdOrNumber);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Identify tracking identifier
  const targetId = orderIdOrNumber || initialOrder?.orderNumber || initialOrder?.id;

  // Real-time fetcher from existing backend order database
  const fetchLatestOrder = useCallback(async (isManual = false) => {
    if (!targetId) return;
    if (isManual) setRefreshing(true);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(targetId)}`);
      const data = await res.json();

      if (data.success && data.order) {
        setCurrentOrder(data.order);
        setFetchError(null);
        setLastSyncedTime(new Date());
        if (isManual) {
          showToast(isMarathi ? 'ऑर्डर स्थिती अपडेट झाली!' : 'Live order status refreshed!', 'success');
        }
      } else if (data.error && !currentOrder) {
        setFetchError(data.error);
      }
    } catch (err: any) {
      console.warn('Real-time order polling error:', err);
      if (isManual) {
        showToast(isMarathi ? 'सर्व्हरशी संपर्क होऊ शकला नाही' : 'Could not refresh order status', 'error');
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [targetId, currentOrder, isMarathi, showToast]);

  // Initial load
  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
    }
    if (targetId) {
      fetchLatestOrder();
    }
  }, [targetId, initialOrder]);

  // Real-time polling timer
  useEffect(() => {
    if (!autoPoll || !targetId) return;

    const interval = setInterval(() => {
      fetchLatestOrder(false);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [autoPoll, targetId, pollIntervalMs, fetchLatestOrder]);

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    showToast(isMarathi ? 'कुरिअर डॉकेट नंबर कॉपी केला' : 'Tracking Docket number copied!', 'info');
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Step definitions with precise manufacturing stage descriptions
  const getStageMeta = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel')) {
      return { stageIndex: -1, progressPercent: 0, color: 'rose', label: isMarathi ? 'ऑर्डर रद्द' : 'Order Cancelled' };
    }
    if (s.includes('deliver') || s === 'completed') {
      return { stageIndex: 5, progressPercent: 100, color: 'emerald', label: isMarathi ? 'डिलिव्हरी पूर्ण' : 'Delivered' };
    }
    if (s.includes('dispatch') || s.includes('ship')) {
      return { stageIndex: 4, progressPercent: 82, color: 'indigo', label: isMarathi ? 'डिलिव्हरी रवाना (Dispatched)' : 'Dispatched' };
    }
    if (s.includes('quality') || s.includes('pick') || s.includes('pack')) {
      return { stageIndex: 3, progressPercent: 65, color: 'purple', label: isMarathi ? 'गुणवत्ता तपासणी (Quality Check)' : 'Quality Check' };
    }
    if (s.includes('print') || s.includes('process') || s.includes('product')) {
      return { stageIndex: 2, progressPercent: 48, color: 'blue', label: isMarathi ? 'प्रिंटिंग सुरू (In Printing)' : 'In Printing' };
    }
    if (s.includes('proof') || s.includes('confirm')) {
      return { stageIndex: 1, progressPercent: 28, color: 'amber', label: isMarathi ? 'प्री-प्रेस आर्टवर्क मंजूर' : 'Design Proof Approved' };
    }
    return { stageIndex: 0, progressPercent: 15, color: 'amber', label: isMarathi ? 'ऑर्डर नोंदवली' : 'Order Placed' };
  };

  if (loading) {
    return (
      <div className={`p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm ${className}`}>
        <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700 font-marathi">
          {isMarathi ? 'थेट ऑर्डर डेटाबेस तपासत आहे...' : 'Connecting to live press database...'}
        </p>
      </div>
    );
  }

  if (fetchError && !currentOrder) {
    return (
      <div className={`p-6 bg-white rounded-3xl border border-rose-200 text-center space-y-3 shadow-sm ${className}`}>
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800 font-marathi">
          {isMarathi ? 'ऑर्डर आढळली नाही' : 'Order Not Found'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-marathi">
          {fetchError}
        </p>
      </div>
    );
  }

  if (!currentOrder) return null;

  const currentStatus = currentOrder.status || 'Order Placed';
  const stageMeta = getStageMeta(currentStatus);
  const activeIdx = stageMeta.stageIndex;

  // Real timeline steps
  const steps: {
    key: string;
    icon: any;
    title: string;
    titleMr: string;
    badge: string;
    badgeMr: string;
    description: string;
    descriptionMr: string;
    estimatedTime: string;
  }[] = [
    {
      key: 'placed',
      icon: CheckCircle2,
      title: 'Order Placed & Confirmed',
      titleMr: 'ऑर्डर नोंदवली व पुष्टी झाली',
      badge: 'Step 1',
      badgeMr: 'टप्पा १',
      description: 'Job specifications, quantities & paper stock confirmed in system.',
      descriptionMr: 'प्रिंटिंग साईज, जीएसएम व ऑर्डर तपशील नोंदवले गेले.',
      estimatedTime: 'Day 1'
    },
    {
      key: 'proof',
      icon: Layers,
      title: 'Pre-Press / Artwork Verified',
      titleMr: 'प्री-प्रेस आर्टवर्क तपासणी',
      badge: 'Step 2',
      badgeMr: 'टप्पा २',
      description: 'Pre-flight check: 300 DPI CMYK color separation & cut margins passed.',
      descriptionMr: 'रंगांचे सेपरेशन, ३०० डीपीआय रिझोल्यूशन आणि कटिंग मार्जिन तपासले.',
      estimatedTime: '+4 Hours'
    },
    {
      key: 'printing',
      icon: Printer,
      title: 'In Printing',
      titleMr: 'प्रिंटिंग सुरू (In Printing)',
      badge: 'Step 3',
      badgeMr: 'टप्पा ३',
      description: 'Heidelberg 4-Color Speedmaster press actively running commercial sheets.',
      descriptionMr: 'हाय-डेफिनिशन ऑफसेट / डिजिटल प्रेसवर पेपर शीट प्रिंटिंग सुरू आहे.',
      estimatedTime: '+12-24 Hours'
    },
    {
      key: 'quality_check',
      icon: ShieldCheck,
      title: 'Quality Check & Finishing',
      titleMr: 'गुणवत्ता तपासणी (Quality Check)',
      badge: 'Step 4',
      badgeMr: 'टप्पा ४',
      description: 'Thermal matte/gloss lamination, precision hydraulic die-cutting & QA passed.',
      descriptionMr: 'थर्मल लॅमिनेशन, डाय-कटिंग व अचूक फिनिशिंग पूर्ण झाली.',
      estimatedTime: '+6 Hours'
    },
    {
      key: 'dispatched',
      icon: Truck,
      title: 'Dispatched via Courier',
      titleMr: 'डिलिव्हरी रवाना (Dispatched)',
      badge: 'Step 5',
      badgeMr: 'टप्पा ५',
      description: 'Shrink-wrapped, labeled & handed over to express surface logistics.',
      descriptionMr: 'पार्सल पॅक करून एक्स्प्रेस कुरिअरकडे ट्रॅकिंगसह सोपवले.',
      estimatedTime: 'In Transit'
    },
    {
      key: 'delivered',
      icon: PackageCheck,
      title: 'Delivered',
      titleMr: 'डिलिव्हरी पूर्ण (Delivered)',
      badge: 'Step 6',
      badgeMr: 'टप्पा ६',
      description: 'Order successfully delivered to client registered destination address.',
      descriptionMr: 'पार्सल ग्राहकाच्या पत्त्यावर सुरक्षित पोहोचवले गेले.',
      estimatedTime: 'Delivered'
    }
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-marathi ${className}`}>
      
      {/* 1. REAL-TIME HEADER BAR */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>{isMarathi ? 'थेट ट्रॅकिंग' : 'Real-Time Tracking'}</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              #{currentOrder.orderNumber}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{isMarathi ? 'प्रिंट ऑर्डर प्रगती' : 'Live Print Production Status'}</span>
          </h3>

          <p className="text-xs text-slate-300">
            {isMarathi ? 'सध्याचा टप्पा:' : 'Current Stage:'}{' '}
            <strong className="text-rose-400 font-bold">{stageMeta.label}</strong>
          </p>
        </div>

        {/* Live Refresh Button & Last Synced */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">
              {isMarathi ? 'शेवटचे सिंक' : 'Live Sync'}
            </span>
            <span className="text-[11px] font-mono text-slate-200">
              {lastSyncedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchLatestOrder(true)}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title={isMarathi ? 'ताजी माहिती मिळवा' : 'Refresh live status from database'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden sm:inline">{isMarathi ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* 2. PROGRESS BAR */}
      <div className="bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
          <span>{isMarathi ? 'एकूण प्रगती' : 'Production Progress'}</span>
          <span className="text-rose-400 font-mono">{stageMeta.progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#FF0038] via-rose-500 to-emerald-400 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${stageMeta.progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. STEP-BY-STEP WORKFLOW TIMELINE */}
      <div className="p-4 sm:p-6 space-y-6">
        
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {steps.map((step, idx) => {
            const isCompleted = activeIdx > idx || (activeIdx === 5 && idx === 5);
            const isCurrent = activeIdx === idx;
            const isUpcoming = activeIdx < idx;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative group">
                
                {/* Step Node Dot */}
                <div 
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : isCurrent 
                        ? 'bg-[#FF0038] text-white ring-4 ring-rose-100 shadow-md animate-pulse' 
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <StepIcon className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Content Card */}
                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-rose-50/60 border-rose-200 shadow-xs' 
                      : isCompleted 
                        ? 'bg-emerald-50/30 border-emerald-100' 
                        : 'bg-slate-50/60 border-slate-100 opacity-75'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isCurrent 
                          ? 'bg-[#FF0038] text-white' 
                          : isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isMarathi ? step.badgeMr : step.badge}
                      </span>
                      
                      <h4 className={`text-xs sm:text-sm font-black ${
                        isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                      }`}>
                        {isMarathi ? step.titleMr : step.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[#FF0038] font-bold bg-white px-2.5 py-0.5 rounded-full border border-rose-200 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          {isMarathi ? 'सध्या कार्यरत' : 'Active Now'}
                        </span>
                      ) : isCompleted ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          {isMarathi ? 'पूर्ण' : 'Completed'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isMarathi ? 'प्रलंबित' : 'Upcoming'}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {isMarathi ? step.descriptionMr : step.description}
                  </p>

                  {/* Contextual Active Alerts for In Printing & Quality Check */}
                  {isCurrent && step.key === 'printing' && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-rose-200 flex items-center gap-2 text-[11px] text-slate-800">
                      <Printer className="w-4 h-4 text-[#FF0038] shrink-0 animate-bounce" />
                      <span>
                        {isMarathi 
                          ? 'ऑफसेट 4-कलर प्रेसवर शीट प्रिंटिंग प्रक्रियेत आहे. लवकरच फिनिशिंगसाठी पाठवले जाईल.' 
                          : 'CPlate imaging passed. 4-Color offset run active with precision densitometer calibration.'}
                      </span>
                    </div>
                  )}

                  {isCurrent && step.key === 'quality_check' && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-purple-200 flex items-center gap-2 text-[11px] text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        {isMarathi 
                          ? 'थर्मल मॅट लॅमिनेशन व अचूक कटिंग तपासणी सुरू आहे.' 
                          : 'Thermal lamination and hydraulic trimming under quality audit.'}
                      </span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

        {/* 4. DISPATCH DOCKET & COURIER DETAILS (If Dispatched or In Transit) */}
        {(activeIdx >= 4 || currentOrder.trackingNumber) && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#FF0038]" />
                <span>{isMarathi ? 'कुरिअर व डिस्पॅच तपशील' : 'Express Courier Dispatch Details'}</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Handed to Courier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Docket Tracking Number</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                    {currentOrder.trackingNumber || 'EXP-IN-938210'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(currentOrder.trackingNumber || 'EXP-IN-938210')}
                    className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy Docket #"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Logistics Service</span>
                <span className="font-bold text-slate-800 block text-xs">
                  Proprint Express Surface Logistics
                </span>
                <span className="text-[10px] text-slate-500">Same-Day / Next-Day Delivery Route</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. DELIVERY DESTINATION SUMMARY */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#FF0038] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">
                {currentOrder.customerName || 'Customer'} • {currentOrder.customerPhone}
              </span>
              <span className="text-slate-600 text-[11px]">
                {currentOrder.shippingAddress || 'Chhatrapati Sambhajinagar'}, {currentOrder.city || 'Chhatrapati Sambhajinagar'} - {currentOrder.pincode || '431001'}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Amount</span>
            <span className="font-black text-slate-900 text-sm sm:text-base text-[#FF0038]">
              ₹{currentOrder.total || currentOrder.totalAmount}
            </span>
          </div>
        </div>

        {/* 6. ACTION CONTROLS */}
        {showActions && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <a
              href={`https://wa.me/919322126863?text=${encodeURIComponent(
                `Hello Proprint! I am checking live tracking for Order #${currentOrder.orderNumber}. Current status is: ${currentStatus}. Can you provide an ETA update?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{isMarathi ? 'थेट व्हॉट्सॲप विचारणा' : 'WhatsApp Status Inquiry'}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                showToast(isMarathi ? 'इनव्हॉइस तयार करत आहे...' : 'Generating tax invoice slip...', 'info');
                window.print();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'प्रिंट पावती' : 'Print Slip / Invoice'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
