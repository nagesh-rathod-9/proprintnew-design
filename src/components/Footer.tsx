import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { ProprintLogo } from './ProprintLogo';
import { useApp } from '../context/AppContext';
import { openDirectWhatsApp } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const { isMarathi } = useApp();

  const handleWhatsAppClick = () => {
    openDirectWhatsApp('Hello Proprint! I would like to know more about your printing and packaging services.');
  };

  return (
    <footer id="main-footer" className="w-full bg-white border-t border-[#E7EAF0] text-slate-600">
      
      {/* 1. UPPER MAIN FOOTER (White Background, 5 Columns matching Reference Design) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand Info (span 4 on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block" aria-label="Proprint Home">
              <ProprintLogo size="md" variant="dark" showTagline={true} />
            </Link>

            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-sm">
              {isMarathi
                ? 'उच्च दर्जाच्या प्रिंटिंग सोल्यूशन्ससाठी आपला विश्वासू भागीदार. बिझनेस कार्ड्सपासून ते कस्टम पॅकेजिंगपर्यंत, आम्ही व्यवसायांना प्रिंट, विकास आणि वेगळेपण मिळवून देतो.'
                : 'Your trusted partner for high-quality printing solutions. From business cards to custom packaging, we help businesses print, grow and stand out.'}
            </p>

            {/* Social Icons matching Reference Design */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E90046] hover:border-[#E90046] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E90046] hover:border-[#E90046] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E90046] hover:border-[#E90046] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E90046] hover:border-[#E90046] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A]">
              {isMarathi ? 'क्विक लिंक्स' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link to="/" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  {isMarathi ? 'मुख्यपृष्ठ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  {isMarathi ? 'उत्पादने' : 'Products'}
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  {isMarathi ? 'डिझाईन पोर्टफोलिओ' : 'Design Portfolio'}
                </Link>
              </li>
              <li>
                <a href="#about" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  {isMarathi ? 'आमच्याबद्दल' : 'About Us'}
                </a>
              </li>
              <li>
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-slate-500 hover:text-[#E90046] transition-colors cursor-pointer text-left"
                >
                  {isMarathi ? 'संपर्क साधा' : 'Contact Us'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A]">
              {isMarathi ? 'आमच्या सेवा' : 'Our Services'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link to="/products?category=visiting-cards" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Offset Printing
                </Link>
              </li>
              <li>
                <Link to="/products?category=brochures" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Digital Printing
                </Link>
              </li>
              <li>
                <Link to="/products?category=packaging" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Packaging Solutions
                </Link>
              </li>
              <li>
                <Link to="/products?category=stickers" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Custom Printing
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-slate-500 hover:text-[#E90046] transition-colors cursor-pointer text-left"
                >
                  Bulk Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A]">
              {isMarathi ? 'सपोर्ट' : 'Support'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link to="/track" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#faqs" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#return-policy" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-slate-500 hover:text-[#E90046] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Get in Touch (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A]">
              {isMarathi ? 'संपर्क साधा' : 'Get in Touch'}
            </h4>
            
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E90046] shrink-0" />
                <a href="tel:+919321200095" className="hover:text-[#E90046] transition-colors font-medium">
                  +91 93212 00095
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E90046] shrink-0" />
                <a href="mailto:support@proprint.in" className="hover:text-[#E90046] transition-colors font-medium">
                  support@proprint.in
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E90046] shrink-0 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>

            {/* Chat on WhatsApp Outline Button matching Reference */}
            <div className="pt-2">
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.546 1.764.82 2.796.82 3.18 0 5.767-2.586 5.767-5.766.001-3.182-2.585-5.768-5.767-5.768zm0 10.455c-.908 0-1.748-.255-2.51-.707l-.18-.107-1.574.413.42-.1.534-.14-1.536.403.42-1.535-.118-.188c-.496-.79-.758-1.545-.758-2.33 0-2.583 2.102-4.685 4.686-4.685 2.583 0 4.685 2.102 4.685 4.685 0 2.584-2.102 4.685 4.685 4.685zm3.327-3.513c-.182-.091-1.077-.532-1.244-.593-.167-.061-.288-.091-.41.091-.121.182-.471.593-.577.714-.107.121-.213.137-.395.046-.182-.091-.77-.284-1.467-.905-.542-.483-.908-1.08-1.015-1.262-.106-.182-.011-.281.08-.371.082-.082.182-.213.274-.319.091-.107.122-.182.182-.304.061-.122.03-.228-.015-.319-.046-.091-.41-1-.562-1.37-.152-.37-.306-.319-.41-.324h-.35c-.121 0-.319.046-.486.228-.167.182-.639.624-.639 1.521 0 .897.654 1.764.745 1.885.091.122 1.287 1.965 3.118 2.755 1.831.79 1.831.527 2.165.496.334-.03 1.077-.44 1.229-.865.152-.426.152-.791.106-.866-.046-.076-.167-.122-.349-.213z"/>
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.986l-1.413 5.163 5.302-1.391c1.455.795 3.097 1.218 4.771 1.218 5.507 0 9.99-4.478 9.99-9.984 0-5.506-4.483-9.976-9.99-9.976zm0 18.293c-1.554 0-3.076-.418-4.402-1.209l-.316-.188-3.146.825.84-3.067-.206-.328c-.868-1.381-1.326-2.986-1.326-4.642 0-4.577 3.724-8.301 8.301-8.301 4.576 0 8.3 3.724 8.3 8.301 0 4.577-3.724 8.309-8.301 8.309z"/>
                </svg>
                <span>Chat on WhatsApp</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. BOTTOM COPYRIGHT BAR (Deep Dark Navy #080D1C matching Reference Design) */}
      <div className="w-full bg-[#080D1C] text-slate-400 border-t border-slate-800 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© 2025 Proprint. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium tracking-wider text-slate-300 uppercase text-[11px]">
            <span>Print</span>
            <span className="text-[#E90046]">•</span>
            <span>Explore</span>
            <span className="text-[#E90046]">•</span>
            <span>Grow</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
