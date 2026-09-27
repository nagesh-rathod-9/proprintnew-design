import React, { useState } from 'react';
import { 
  Palette, 
  Store, 
  Heart, 
  Radio, 
  Briefcase, 
  Sparkles, 
  Printer, 
  Layers, 
  Stamp, 
  FileCheck, 
  Tag, 
  Calendar, 
  Package, 
  Scissors, 
  Award, 
  Image as ImageIcon, 
  Maximize, 
  Shirt,
  MessageSquare,
  ArrowRight,
  Clock,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceItem } from '../types';
import { useApp } from '../context/AppContext';

interface OurServicesShowcaseProps {
  onSelectService?: (service: ServiceItem) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
  onOpenWhatsApp?: (message?: string) => void;
}

export const OurServicesShowcase: React.FC<OurServicesShowcaseProps> = ({
  onOpenQuoteModal,
  onOpenWhatsApp
}) => {
  const { isMarathi, services = [], showToast } = useApp();
  const navigate = useNavigate();
  const [activeServiceCategory, setActiveServiceCategory] = useState<'all' | 'branding' | 'printing'>('all');

  const filteredServices = services.filter((s) => {
    if (activeServiceCategory === 'all') return true;
    return s.category === activeServiceCategory;
  });

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Store': return <Store className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Printer': return <Printer className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Stamp': return <Stamp className="w-5 h-5" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5" />;
      case 'Tag': return <Tag className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      case 'Package': return <Package className="w-5 h-5" />;
      case 'Scissors': return <Scissors className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Image': return <ImageIcon className="w-5 h-5" />;
      case 'Maximize': return <Maximize className="w-5 h-5" />;
      case 'Shirt': return <Shirt className="w-5 h-5" />;
      default: return <Printer className="w-5 h-5" />;
    }
  };

  const handleWhatsAppInquiry = (service: ServiceItem) => {
    const text = `Hello Proprint! I am interested in your "${service.name}" service (${service.tagline}). Please share pricing and production schedule.`;
    if (onOpenWhatsApp) {
      onOpenWhatsApp(text);
    } else {
      showToast(`Inquiry sent for ${service.name}! Our design desk will contact you.`, 'success');
    }
  };

  return (
    <section id="services-showcase" className="py-12 md:py-16 bg-white border-y border-slate-200/80 font-marathi">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 md:px-8">
        <div className="space-y-6">
          <div className="text-left max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-200 shadow-2xs font-marathi">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>{isMarathi ? 'प्रिंटिंग व मीडिया सेवा' : 'Print & Media Services'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-left">
              {isMarathi ? 'आमच्या सेवा' : 'Our Services'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-marathi text-left">
              {isMarathi
                ? 'ब्रँडिंग, ग्राफिक डिझाईन, प्रिंटिंग आणि पॅकेजिंगच्या सर्व इन-हाऊस सेवांची दुरुस्ती आणि गुणवत्ता यासह यादी.'
                : 'Complete in-house solutions for branding, design, packaging, and commercial printing with fast production and quality control.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-marathi text-left">
                {isMarathi ? `सर्व ${services.length} सेवा` : `Complete Service Catalog (${services.length})`}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveServiceCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-marathi ${
                  activeServiceCategory === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isMarathi ? `सर्व (${services.length})` : `All (${services.length})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveServiceCategory('branding')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-marathi ${
                  activeServiceCategory === 'branding'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isMarathi ? 'ब्रँडिंग व डिझाईन' : 'Branding & Design'}
              </button>

              <button
                type="button"
                onClick={() => setActiveServiceCategory('printing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-marathi ${
                  activeServiceCategory === 'printing'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isMarathi ? 'प्रिंट व पॅकेजिंग' : 'Print & Packaging'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredServices.map((service) => {
              const isVisitingCardService = service.id === 'srv-visiting-cards' || service.name.toLowerCase().includes('visiting card');

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-rose-400 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        {getServiceIcon(service.iconName)}
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-marathi ${
                        service.category === 'branding'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {service.category === 'branding' ? (isMarathi ? 'डिझाईन व मीडिया' : 'Design & Media') : (isMarathi ? 'प्रिंट व पॅक' : 'Print & Pack')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors font-marathi">
                        {service.name}
                      </h4>
                      <p className="text-xs font-semibold text-rose-600 mt-0.5 font-marathi">
                        {service.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-marathi">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium font-marathi">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.turnaround}</span>
                      </span>
                      <span className="text-slate-400 font-semibold">{isMarathi ? `किमान: ${service.minOrder}` : `Min: ${service.minOrder}`}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {isVisitingCardService ? (
                        <>
                          <button
                            onClick={() => navigate('/design-studio')}
                            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer font-marathi"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isMarathi ? 'कस्टमायझ' : 'Customize'}</span>
                          </button>

                          <button
                            onClick={() => handleWhatsAppInquiry(service)}
                            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs font-marathi"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleWhatsAppInquiry(service)}
                            className="w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-marathi"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => onOpenQuoteModal && onOpenQuoteModal(service.name)}
                            className="w-full bg-slate-900 hover:bg-rose-600 text-white py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer font-marathi"
                          >
                            <span>{isMarathi ? 'कोटेशन घ्या' : 'Get Quote'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
