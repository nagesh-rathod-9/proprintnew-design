import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, MessageSquare, UserRound, Phone, Package, Layers, Zap, ShieldCheck, Truck, Lock, ChevronDown, ArrowRight, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { openDirectWhatsApp } from '../utils/whatsapp';
import quoteBackground from '../assets/images/proprint_packaging_hero_1788925583688.jpg';

const QUOTE_SERVICES = [
  'Commercial Printing',
  'Business Cards',
  'Packaging Boxes',
  'Brochures & Catalogs',
  'Envelopes',
  'Stickers & Labels',
  'Other / Custom'
];

interface GetQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceOrProduct?: string;
}

export const GetQuoteModal: React.FC<GetQuoteModalProps> = ({
  isOpen,
  onClose,
  initialServiceOrProduct = ''
}) => {
  const { addQuote, isMarathi } = useApp();

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceRequired, setServiceRequired] = useState(initialServiceOrProduct || 'Commercial Printing');
  const [estimatedQuantity, setEstimatedQuantity] = useState('500');
  const [projectDescription, setProjectDescription] = useState('');
  const [needsDesignHelp, setNeedsDesignHelp] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getQuoteSpecifications = () => [
    projectDescription.trim(),
    needsDesignHelp ? 'Design support requested.' : ''
  ].filter(Boolean).join('\n');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone) return;

    addQuote({
      clientName,
      customerName: clientName,
      name: clientName,
      phone,
      customerPhone: phone,
      email,
      customerEmail: email,
      serviceRequired,
      productCategory: serviceRequired,
      category: serviceRequired,
      estimatedQuantity,
      quantity: estimatedQuantity,
      projectDescription: getQuoteSpecifications(),
      specialInstructions: getQuoteSpecifications(),
      specifications: getQuoteSpecifications(),
      status: 'New'
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  const handleSendOnWhatsApp = () => {
    const finalName = clientName || 'Client';
    const finalPhone = phone || 'Direct WhatsApp';
    const finalService = serviceRequired || 'Commercial Printing';
    const finalQty = estimatedQuantity || '500';

    addQuote({
      clientName: finalName,
      customerName: finalName,
      name: finalName,
      phone: finalPhone,
      customerPhone: finalPhone,
      email,
      customerEmail: email,
      serviceRequired: finalService,
      productCategory: finalService,
      category: finalService,
      estimatedQuantity: finalQty,
      quantity: finalQty,
      projectDescription: getQuoteSpecifications(),
      specialInstructions: getQuoteSpecifications(),
      specifications: getQuoteSpecifications(),
      status: 'New'
    });

    const msg = `👋 *Custom Quote Inquiry - Proprint*\n\n` +
      `👤 *Client Name:* ${finalName}\n` +
      `📞 *Phone:* ${finalPhone}\n` +
      (email ? `📧 *Email:* ${email}\n` : '') +
      `📦 *Service / Product:* ${finalService}\n` +
      `🔢 *Estimated Qty:* ${finalQty}\n` +
      (projectDescription ? `📝 *Specifications:* ${projectDescription}\n` : '') +
      (needsDesignHelp ? '🎨 *Design support:* Yes\n\n' : '\n') +
      `Please provide factory-direct quote and turnaround estimate. Thank you!`;

    openDirectWhatsApp(msg);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl md:max-h-[calc(100dvh-3rem)] md:grid-cols-[0.82fr_1.18fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="relative isolate min-h-[230px] overflow-hidden bg-rose-50 px-6 py-6 sm:px-8 md:min-h-[620px]">
          <img
            src={quoteBackground}
            alt="Custom printed packaging and stationery"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/95 via-white/85 to-white/20" />
          <div className="relative z-20 flex min-h-[180px] flex-col justify-between md:min-h-[572px]">
            <div>
              <div className="mb-1 h-0.5 w-16 rounded-full bg-[#E90046]" />
              <div className="text-2xl font-black leading-none">
                <span className="text-slate-900">pro</span>
                <span className="text-[#E90046]">print</span>
              </div>
              <p className="mt-1 text-[8px] tracking-[2px] text-slate-500">FOR ALL PRINTING SOLUTIONS</p>
            </div>

            <div className="mt-6 md:mt-10">
              <p className="mb-2 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#E90046]">
                {isMarathi ? 'थेट कारखाना दर' : 'Instant Factory Estimate'}
              </p>
              <h2 className="max-w-[340px] text-3xl font-black leading-[1.02] text-slate-950 sm:text-4xl">
                {isMarathi ? 'आपले कस्टम कोटेशन मिळवा' : 'Get a Custom Quote'}
              </h2>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isMarathi ? 'आपल्याला काय हवे आहे ते सांगा. आम्ही सर्वोत्तम दरासह संपर्क करू.' : 'Tell us what you need. We’ll share the best pricing with you.'}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3">
                {[
                  { icon: Zap, title: 'Factory-direct pricing', detail: 'Best rates, no middlemen' },
                  { icon: ShieldCheck, title: 'High quality printing', detail: 'Premium materials & finish' },
                  { icon: Truck, title: 'Fast turnaround', detail: 'On-time delivery across India' }
                ].map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="flex min-w-0 items-center gap-2 md:gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[#E90046] md:h-9 md:w-9">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="hidden min-w-0 md:block">
                      <span className="block text-xs font-bold text-slate-900">{title}</span>
                      <span className="block text-[10px] text-slate-600">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative min-w-0 bg-white px-5 py-6 sm:px-8 sm:py-8 md:overflow-y-auto md:px-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close quote request"
          >
            <X className="h-4 w-4" />
          </button>

          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center space-y-3 px-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isMarathi ? 'कोटेशन मागणी यशस्वीरीत्या पाठवली!' : 'Quote Request Received!'}
              </h3>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                {isMarathi ? 'आमची टीम लवकरच आपल्याशी संपर्क करेल.' : 'Our print team will review your specifications and send you a quote.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 pr-10">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#E90046] md:hidden">Instant Factory Estimate</p>
                <h3 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Request a Custom Quote</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Fill in the details and we’ll get back to you with the best price.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Your Name <span className="text-[#E90046]">*</span></label>
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-[#E90046] focus-within:ring-2 focus-within:ring-rose-100">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Phone Number <span className="text-[#E90046]">*</span></label>
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-[#E90046] focus-within:ring-2 focus-within:ring-rose-100">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9322126863"
                        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Service / Product <span className="text-[#E90046]">*</span></label>
                    <div className="relative">
                      <Package className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <select
                        required
                        value={serviceRequired}
                        onChange={(e) => setServiceRequired(e.target.value)}
                        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-800 outline-none focus:border-[#E90046] focus:ring-2 focus:ring-rose-100"
                      >
                        {!QUOTE_SERVICES.includes(serviceRequired) && <option value={serviceRequired}>{serviceRequired}</option>}
                        {QUOTE_SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Estimated Quantity <span className="text-[#E90046]">*</span></label>
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-[#E90046] focus-within:ring-2 focus-within:ring-rose-100">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <input
                        type="number"
                        min="1"
                        required
                        value={estimatedQuantity}
                        onChange={(e) => setEstimatedQuantity(e.target.value)}
                        placeholder="e.g. 500"
                        className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Project Specifications / Dimensions <span className="font-normal text-slate-400">(Optional)</span></label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                      placeholder="e.g. 350 GSM matte finish, spot UV logo, size 3x2 inches, delivery in Pune..."
                      className="w-full resize-y rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs leading-relaxed outline-none placeholder:text-slate-400 focus:border-[#E90046] focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg py-1">
                  <input
                    type="checkbox"
                    checked={needsDesignHelp}
                    onChange={(e) => setNeedsDesignHelp(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#E90046]"
                  />
                  <span>
                    <span className="block font-bold text-slate-800">Need design help?</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">Our team can help prepare your artwork.</span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E90046] text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#d0003e]"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isMarathi ? 'कोटेशन पाठवा' : 'Submit Quote Request'}</span>
                </button>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleSendOnWhatsApp}
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-emerald-400 px-3.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 fill-current" />Chat on WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="flex items-center justify-center gap-1.5 pt-1 text-[9px] text-slate-400">
                  <Lock className="h-3 w-3" />
                  Your information is safe with us. We do not share your details.
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
