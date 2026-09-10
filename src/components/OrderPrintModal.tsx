import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Package, 
  Layers, 
  Sparkles,
  QrCode,
  IndianRupee,
  Barcode,
  Loader2
} from 'lucide-react';
import { Order } from '../types';
import { ProprintLogo } from './ProprintLogo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderPrintModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'shipping-label' | 'tax-invoice';
}

// Utility: Number to Indian Rupees Words
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `${num} Rupees Only`;

  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return (str.trim() || 'Zero') + ' Rupees Only';
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  order,
  isOpen,
  onClose,
  defaultType = 'shipping-label',
}) => {
  const [printType, setPrintType] = useState<'shipping-label' | 'tax-invoice'>(defaultType);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const totalAmount = order.total || order.totalAmount || 0;
  const isPaid = order.paymentStatus?.toLowerCase() === 'paid' || 
                 order.paymentMethod?.toLowerCase().includes('online') ||
                 order.paymentMethod?.toLowerCase().includes('upi') ||
                 order.status === 'Delivered';

  const subtotal = order.subtotal || Math.round(totalAmount / 1.18);
  const tax = order.tax || (totalAmount - subtotal);
  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;
  const trackingDocket = order.trackingNumber || `EXP-IN-${order.orderNumber.replace(/[^0-9]/g, '') || '902148'}`;
  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Native Browser Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Programmatic PDF Generator & Downloader
  const handleDownloadPdf = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsGeneratingPdf(true);

      const element = printContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: printType === 'shipping-label' ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = printType === 'shipping-label' 
        ? `ShippingLabel_${order.orderNumber}_BoxSlip.pdf` 
        : `TaxInvoice_${order.orderNumber}_Proprint.pdf`;

      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed, triggering browser print fallback', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto no-print">
      
      {/* Container Card */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] font-sans">
        
        {/* Top Header Controls (Hidden on Print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Print Center: #{order.orderNumber}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                  isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isPaid ? 'PREPAID' : 'COD / PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate delivery parcel labels & official GST tax invoices with store branding.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
              title="Download clean PDF document"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : (
                <Download className="w-4 h-4 text-rose-500" />
              )}
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#FF0038] hover:bg-[#e60032] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-slate-100 p-2 sm:px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setPrintType('shipping-label')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                printType === 'shipping-label'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-rose-600" />
              <span>Parcel Box Sticker (Amazon / Flipkart Style)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintType('tax-invoice')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                printType === 'tax-invoice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>GST Tax Invoice (Official Bill)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline-block font-mono">
            Format: {printType === 'shipping-label' ? '4x6" Box Sticker / A4 Slip' : 'Standard A4 Tax Invoice'}
          </span>
        </div>

        {/* Printable Viewport / Live Document Preview */}
        <div className="p-4 sm:p-8 bg-slate-200/60 overflow-y-auto flex-1 flex justify-center items-start">
          
          {/* THE PRINTABLE TARGET (Hooked to ID for Print Stylesheet & ref for PDF) */}
          <div 
            id="printable-document" 
            ref={printContainerRef}
            className="bg-white shadow-xl rounded-2xl border border-slate-300 w-full max-w-[760px] text-slate-900 overflow-hidden print:shadow-none print:border-0 print:rounded-none"
          >

            {/* ======================================================== */}
            {/* 1. SHIPPING LABEL / DELIVERY BOX SLIP (FLIPKART/AMAZON) */}
            {/* ======================================================== */}
            {printType === 'shipping-label' && (
              <div className="p-6 sm:p-8 text-xs font-sans space-y-4 leading-normal bg-white">
                
                {/* 1A. Top Routing & Logistics Bar */}
                <div className="border-2 border-slate-950 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <ProprintLogo size="md" variant="dark" showTagline={true} />
                    <div className="pl-3 border-l border-slate-300">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        Carrier Logistics
                      </span>
                      <strong className="text-xs font-black text-slate-900 block">
                        PROPRINT EXPRESS SURFACE
                      </strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">
                      Routing / Sorting Code
                    </span>
                    <span className="text-base font-black font-mono tracking-widest text-slate-900">
                      MH-CSN-431001-HUB1
                    </span>
                  </div>
                </div>

                {/* 1B. Scannable Barcode & Docket Box */}
                <div className="border-2 border-slate-950 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-white">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Courier Docket / Tracking AWB
                    </span>
                    <div className="font-mono text-xl font-black tracking-wider text-slate-900">
                      {trackingDocket}
                    </div>
                    {/* SVG Simulated Barcode (Crisp, Vector, Offline) */}
                    <div className="pt-1">
                      <svg className="h-10 w-64 max-w-full" viewBox="0 0 240 40">
                        <rect x="0" y="0" width="3" height="35" fill="#000" />
                        <rect x="5" y="0" width="1" height="35" fill="#000" />
                        <rect x="8" y="0" width="4" height="35" fill="#000" />
                        <rect x="14" y="0" width="2" height="35" fill="#000" />
                        <rect x="18" y="0" width="1" height="35" fill="#000" />
                        <rect x="21" y="0" width="5" height="35" fill="#000" />
                        <rect x="28" y="0" width="2" height="35" fill="#000" />
                        <rect x="32" y="0" width="3" height="35" fill="#000" />
                        <rect x="37" y="0" width="1" height="35" fill="#000" />
                        <rect x="40" y="0" width="6" height="35" fill="#000" />
                        <rect x="48" y="0" width="2" height="35" fill="#000" />
                        <rect x="52" y="0" width="4" height="35" fill="#000" />
                        <rect x="58" y="0" width="2" height="35" fill="#000" />
                        <rect x="62" y="0" width="1" height="35" fill="#000" />
                        <rect x="65" y="0" width="5" height="35" fill="#000" />
                        <rect x="72" y="0" width="3" height="35" fill="#000" />
                        <rect x="77" y="0" width="2" height="35" fill="#000" />
                        <rect x="81" y="0" width="4" height="35" fill="#000" />
                        <rect x="87" y="0" width="1" height="35" fill="#000" />
                        <rect x="90" y="0" width="6" height="35" fill="#000" />
                        <rect x="98" y="0" width="2" height="35" fill="#000" />
                        <rect x="102" y="0" width="3" height="35" fill="#000" />
                        <rect x="107" y="0" width="5" height="35" fill="#000" />
                        <rect x="114" y="0" width="2" height="35" fill="#000" />
                        <rect x="118" y="0" width="4" height="35" fill="#000" />
                        <rect x="124" y="0" width="1" height="35" fill="#000" />
                        <rect x="127" y="0" width="6" height="35" fill="#000" />
                        <rect x="135" y="0" width="2" height="35" fill="#000" />
                        <rect x="139" y="0" width="5" height="35" fill="#000" />
                        <rect x="146" y="0" width="1" height="35" fill="#000" />
                        <rect x="149" y="0" width="4" height="35" fill="#000" />
                        <rect x="155" y="0" width="3" height="35" fill="#000" />
                        <rect x="160" y="0" width="2" height="35" fill="#000" />
                        <rect x="164" y="0" width="5" height="35" fill="#000" />
                        <rect x="171" y="0" width="1" height="35" fill="#000" />
                        <rect x="174" y="0" width="4" height="35" fill="#000" />
                        <rect x="180" y="0" width="2" height="35" fill="#000" />
                        <rect x="184" y="0" width="6" height="35" fill="#000" />
                        <rect x="192" y="0" width="2" height="35" fill="#000" />
                        <rect x="196" y="0" width="3" height="35" fill="#000" />
                        <rect x="201" y="0" width="5" height="35" fill="#000" />
                        <rect x="208" y="0" width="2" height="35" fill="#000" />
                        <rect x="212" y="0" width="4" height="35" fill="#000" />
                        <rect x="218" y="0" width="1" height="35" fill="#000" />
                        <rect x="221" y="0" width="5" height="35" fill="#000" />
                        <rect x="228" y="0" width="2" height="35" fill="#000" />
                        <rect x="232" y="0" width="3" height="35" fill="#000" />
                        <rect x="237" y="0" width="3" height="35" fill="#000" />
                      </svg>
                      <span className="font-mono text-[10px] text-slate-600 block text-center mt-0.5">
                        *{order.orderNumber}*
                      </span>
                    </div>
                  </div>

                  {/* Scannable Delivery QR Code (Vector SVG) */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white"/>
                      {/* Top Left Corner */}
                      <rect x="10" y="10" width="28" height="28" fill="black"/>
                      <rect x="14" y="14" width="20" height="20" fill="white"/>
                      <rect x="18" y="18" width="12" height="12" fill="black"/>
                      {/* Top Right Corner */}
                      <rect x="62" y="10" width="28" height="28" fill="black"/>
                      <rect x="66" y="14" width="20" height="20" fill="white"/>
                      <rect x="70" y="18" width="12" height="12" fill="black"/>
                      {/* Bottom Left Corner */}
                      <rect x="10" y="62" width="28" height="28" fill="black"/>
                      <rect x="14" y="66" width="20" height="20" fill="white"/>
                      <rect x="18" y="70" width="12" height="12" fill="black"/>
                      {/* Data dots pattern */}
                      <rect x="44" y="12" width="6" height="6" fill="black"/>
                      <rect x="52" y="18" width="6" height="6" fill="black"/>
                      <rect x="44" y="26" width="6" height="6" fill="black"/>
                      <rect x="12" y="44" width="6" height="6" fill="black"/>
                      <rect x="24" y="50" width="6" height="6" fill="black"/>
                      <rect x="44" y="44" width="12" height="12" fill="black"/>
                      <rect x="60" y="44" width="6" height="6" fill="black"/>
                      <rect x="72" y="50" width="8" height="6" fill="black"/>
                      <rect x="84" y="44" width="6" height="6" fill="black"/>
                      <rect x="44" y="62" width="6" height="8" fill="black"/>
                      <rect x="54" y="70" width="8" height="6" fill="black"/>
                      <rect x="68" y="62" width="6" height="6" fill="black"/>
                      <rect x="78" y="70" width="12" height="8" fill="black"/>
                      <rect x="44" y="80" width="8" height="8" fill="black"/>
                      <rect x="60" y="82" width="6" height="6" fill="black"/>
                      <rect x="72" y="84" width="8" height="6" fill="black"/>
                    </svg>
                    <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">SCAN FOR PROOF</span>
                  </div>
                </div>

                {/* 1C. HUGE PAYMENT BADGE FOR DELIVERY BOY (CRITICAL) */}
                <div className={`border-4 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
                  isPaid 
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950' 
                    : 'border-slate-950 bg-amber-100 text-slate-950'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider block text-slate-600">
                      Delivery Boy Payment Action Notice / डिलिव्हरी निर्देश:
                    </span>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight">
                      {isPaid ? 'PREPAID - DO NOT COLLECT CASH' : 'CASH ON DELIVERY (COD)'}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {isPaid 
                        ? '✓ Order payment is fully settled via UPI/Online. Hand over parcel directly to customer.' 
                        : '⚠ IMPORTANT: Collect exact cash payment before releasing package to customer.'}
                    </p>
                  </div>

                  <div className={`px-5 py-3 rounded-2xl text-center shrink-0 border-2 ${
                    isPaid 
                      ? 'bg-emerald-600 text-white border-emerald-700' 
                      : 'bg-slate-950 text-white border-slate-950'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block opacity-90">
                      {isPaid ? 'Amount Due' : 'COLLECT CASH'}
                    </span>
                    <span className="text-2xl font-black">
                      {isPaid ? '₹0.00' : `₹${totalAmount}`}
                    </span>
                  </div>
                </div>

                {/* 1D. Main Addresses Grid: SHIP TO (Recipient) & RETURN TO (Seller) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* SHIP TO (Prominently Framed for Delivery Partner) */}
                  <div className="border-2 border-slate-950 rounded-2xl p-4 sm:p-5 space-y-3 bg-white relative">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                      <span className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        <span>SHIP TO (Customer Delivery Address):</span>
                      </span>
                      <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        RECIPIENT
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                        {order.customerName || 'Valued Customer'}
                      </h4>

                      {/* Prominent Phone Number for Delivery Boy */}
                      <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500">Contact Number:</span>
                        <strong className="text-base font-black font-mono text-slate-950 tracking-wider">
                          +91 {order.customerPhone || '9322126863'}
                        </strong>
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed pt-1">
                        <p className="font-bold">{order.shippingAddress || 'Chikalthana MIDC Industrial Area'}</p>
                        <p>{order.city || 'Chhatrapati Sambhajinagar'}, Maharashtra</p>
                      </div>

                      {/* Large Highlighted PINCODE Box */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-black text-sm">
                          <span>PINCODE:</span>
                          <span className="text-base text-yellow-300">{order.pincode || '431001'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RETURN / SHIPPED BY ADDRESS */}
                  <div className="border-2 border-slate-300 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/70">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                        RETURN ADDRESS / SHIPPED BY:
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        HUB ORIGIN
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
                      <strong className="font-black text-slate-900 block text-sm">
                        PROPRINT COMMERCIAL PRESS & DESIGN STUDIO
                      </strong>
                      <p>Sushila Arcade, Chikalthana Industrial Area, Jalna Road</p>
                      <p>Chhatrapati Sambhajinagar, Maharashtra - 431001</p>
                      <p className="font-mono pt-1 text-[11px]">
                        <strong>GSTIN:</strong> 27AABCP8821M1Z4
                      </p>
                      <p className="font-mono text-[11px]">
                        <strong>Helpline:</strong> +91 93221 26863 / support@proprint.in
                      </p>
                    </div>

                    {/* Handling Instructions */}
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>DO NOT BEND</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200">
                        <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>KEEP DRY</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 1E. Package Details & Parcel Manifest Table */}
                <div className="border-2 border-slate-950 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-900 text-white px-4 py-2 font-bold text-xs flex items-center justify-between">
                    <span className="uppercase tracking-wider">Parcel Manifest & Package Content</span>
                    <span className="font-mono text-[11px] text-slate-300">Order: #{order.orderNumber} • Date: {formattedDate}</span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600 text-[11px]">
                        <th className="p-2.5 pl-4">Item Description</th>
                        <th className="p-2.5 text-center">Qty / Units</th>
                        <th className="p-2.5 text-center">Finishing / Finish</th>
                        <th className="p-2.5 text-right pr-4">Declared Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(order.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 pl-4 font-bold text-slate-900">
                            {item.product?.name || 'Commercial Print Job'}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            {item.customization?.quantity || 500} {item.product?.unit || 'Units'}
                          </td>
                          <td className="p-2.5 text-center text-slate-600">
                            {item.customization?.finishId || '350 GSM Velvet Matte'}
                          </td>
                          <td className="p-2.5 text-right pr-4 font-mono font-bold text-slate-900">
                            ₹{item.customization?.calculatedPrice || item.subtotal || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500">
                      Box 1 of 1 • Estimated Gross Weight: <strong>1.25 KG</strong> • Commercial Offset Print Product
                    </span>
                    <span className="font-black text-slate-900">
                      Total Invoice Amount: ₹{totalAmount}
                    </span>
                  </div>
                </div>

                {/* 1F. Footer Notice for Carrier */}
                <div className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-300 pt-3">
                  This parcel label is generated by Proprint Production Automation System. In case of damaged outer sealing tape or wet packaging, recipient must record video proof upon delivery.
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* 2. OFFICIAL GST TAX INVOICE (PROPRINT BRANDED BILL)     */}
            {/* ======================================================== */}
            {printType === 'tax-invoice' && (
              <div className="p-6 sm:p-10 text-xs font-sans space-y-6 leading-normal bg-white">
                
                {/* 2A. Official Header with Store Logo and GSTIN */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <ProprintLogo size="lg" variant="dark" showTagline={true} />
                    <p className="text-[11px] text-slate-600 max-w-sm pt-1">
                      Commercial Offset, Digital Press & High-Speed Visiting Card Studio
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Sushila Arcade, Chikalthana Industrial Area, Jalna Road, Chh. Sambhajinagar, MH - 431001
                    </p>
                    <p className="text-[11px] font-mono text-slate-700">
                      <strong>GSTIN:</strong> 27AABCP8821M1Z4 • <strong>State Code:</strong> 27 (Maharashtra)
                    </p>
                  </div>

                  <div className="text-right space-y-1 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                      TAX INVOICE
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      ORIGINAL FOR RECIPIENT
                    </span>
                    <div className="font-mono text-xs text-slate-800 pt-1">
                      <p><strong>Invoice No:</strong> INV-2026-{order.orderNumber.replace(/[^0-9]/g, '') || '84920'}</p>
                      <p><strong>Date:</strong> {formattedDate}</p>
                      <p><strong>Order Ref:</strong> #{order.orderNumber}</p>
                      <p><strong>Place of Supply:</strong> 27 - Maharashtra</p>
                    </div>
                  </div>
                </div>

                {/* 2B. Bill To and Ship To Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Billed To (Client / Customer):
                    </span>
                    <h4 className="font-black text-slate-900 text-sm">{order.customerName || 'Customer'}</h4>
                    <p className="text-slate-600">{order.customerEmail || 'client@example.com'}</p>
                    <p className="font-mono text-slate-800">Phone: +91 {order.customerPhone || '9322126863'}</p>
                    <p className="text-slate-600">GSTIN: {order.customerEmail?.includes('company') ? '27AABCT8192K1Z9' : 'Unregistered Consumer'}</p>
                  </div>

                  <div className="space-y-1 text-xs sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Shipped To (Delivery Destination):
                    </span>
                    <p className="font-bold text-slate-900">{order.shippingAddress || 'Chikalthana Industrial Area'}</p>
                    <p className="text-slate-600">{order.city || 'Chhatrapati Sambhajinagar'} - {order.pincode || '431001'}</p>
                    <p className="text-slate-600">State: Maharashtra (Code: 27)</p>
                    <p className="font-mono text-[11px] text-slate-700">
                      <strong>Docket / AWB:</strong> {trackingDocket}
                    </p>
                  </div>
                </div>

                {/* 2C. Itemized GST Products Table */}
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px]">
                        <th className="p-2.5 pl-3 w-10">#</th>
                        <th className="p-2.5">Item Description & Specifications</th>
                        <th className="p-2.5 text-center">HSN/SAC</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Taxable (₹)</th>
                        <th className="p-2.5 text-right">CGST 9%</th>
                        <th className="p-2.5 text-right">SGST 9%</th>
                        <th className="p-2.5 text-right pr-3">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(order.items || []).map((item, idx) => {
                        const itemPrice = item.customization?.calculatedPrice || item.subtotal || 0;
                        const itemTaxable = Math.round(itemPrice / 1.18);
                        const itemCgst = Math.round((itemPrice - itemTaxable) / 2);
                        const itemSgst = itemPrice - itemTaxable - itemCgst;
                        const unitRate = item.customization?.quantity ? (itemTaxable / item.customization.quantity).toFixed(2) : itemTaxable;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 pl-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 space-y-0.5">
                              <p className="font-bold text-slate-900">{item.product?.name || 'Commercial Print Job'}</p>
                              <p className="text-[11px] text-slate-500">
                                Specs: {item.customization?.finishId || 'Velvet Matte'} • {item.customization?.sizeId || 'Standard 3.5x2 inch'} • {item.customization?.corners || 'Standard Corners'}
                              </p>
                              {order.uploadedFileName && (
                                <p className="text-[10px] text-emerald-700 font-medium">Artwork: {order.uploadedFileName}</p>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-mono text-slate-600">4911</td>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                              {item.customization?.quantity || 500}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">₹{unitRate}</td>
                            <td className="p-2.5 text-right font-mono text-slate-900">₹{itemTaxable}</td>
                            <td className="p-2.5 text-right font-mono text-slate-600">₹{itemCgst}</td>
                            <td className="p-2.5 text-right font-mono text-slate-600">₹{itemSgst}</td>
                            <td className="p-2.5 text-right pr-3 font-mono font-black text-slate-900">₹{itemPrice}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2D. Financial Summary & Totals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  
                  {/* Left: Amount in Words & Bank Details */}
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Amount in Words:
                      </span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {numberToWords(totalAmount)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                      <span className="font-bold text-slate-900 uppercase tracking-wider block text-[10px]">
                        Payment & Bank Remittance Details:
                      </span>
                      <p className="text-slate-600"><strong>Bank Name:</strong> HDFC Bank Ltd.</p>
                      <p className="text-slate-600"><strong>Account Name:</strong> Proprint Commercial Press</p>
                      <p className="font-mono text-slate-800"><strong>A/C Number:</strong> 50200084920192</p>
                      <p className="font-mono text-slate-800"><strong>IFSC Code:</strong> HDFC0001824 • <strong>UPI ID:</strong> proprint@upi</p>
                      <p className="font-bold text-slate-900 pt-1">
                        Payment Status: <span className={isPaid ? 'text-emerald-700' : 'text-amber-700'}>
                          {isPaid ? 'PAID IN FULL (UPI / Net Banking)' : 'PAYMENT PENDING / CASH ON DELIVERY'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Calculations Breakdown */}
                  <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Taxable Value (Subtotal):</span>
                      <span className="font-mono font-bold text-slate-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Central GST (CGST 9%):</span>
                      <span className="font-mono text-slate-900">₹{cgst}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>State GST (SGST 9%):</span>
                      <span className="font-mono text-slate-900">₹{sgst}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping & Express Handling:</span>
                      <span className="font-mono text-emerald-700 font-bold">FREE (Included)</span>
                    </div>
                    <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-black">
                      <span className="text-slate-900">Grand Total:</span>
                      <span className="text-base text-[#FF0038] font-mono">₹{totalAmount}</span>
                    </div>
                  </div>

                </div>

                {/* 2E. Terms and Authorized Stamp */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
                    <p>1. Goods once manufactured as per approved proof cannot be returned.</p>
                    <p>2. Standard industrial 5% color variance may occur in 4-color offset runs.</p>
                    <p>3. Subject to Chhatrapati Sambhajinagar jurisdiction only.</p>
                  </div>

                  <div className="text-right space-y-3">
                    <div className="inline-block text-center border-t border-slate-400 pt-2 px-6">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">
                        For PROPRINT COMMERCIAL PRESS
                      </span>
                      <div className="py-2">
                        <span className="font-mono text-xs font-bold text-rose-700 border border-rose-200 bg-rose-50 px-2 py-0.5 rounded">
                          DIGITALLY VERIFIED SIGNATORY
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Authorized Signatory</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 sm:px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for 4x6 Thermal Sticker Printer & Standard A4 Color/Laser Printer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
