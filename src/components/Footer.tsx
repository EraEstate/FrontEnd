import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail,
  Facebook,
  Youtube,
  Twitter,
  Send,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gray-50/80 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-6 group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-700 transition-colors">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <div className="text-lg font-bold">
                  <span className="text-red-600">Era</span>
                  <span className="text-gray-800"> Estate</span>
                </div>
                <div className="text-xs text-gray-500 -mt-0.5">
                  by PropertyGuru
                </div>
              </div>
            </Link>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <div className="text-gray-900 font-medium mb-1">{t('footer.office')}</div>
                  <div>{t('footer.officeAddress.line1')}</div>
                  <div>{t('footer.officeAddress.line2')}</div>
                  <div>{t('footer.officeAddress.line3')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-x-2 pt-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href="tel:19001234" className="text-gray-900 font-medium hover:text-red-600 transition-colors">
                  {t('footer.phone')}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-base">{t('footer.aboutUs')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('header.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('header.contact')}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('header.news')}
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=terms" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=terms" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Trung tâm pháp lý
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-600 hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Trung tâm bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-base">{t('footer.support')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <a href="tel:19001234" className="hover:text-red-600 transition-colors inline-flex items-center group">
                  <Phone className="h-3.5 w-3.5 mr-2 text-gray-400 group-hover:text-red-600" />
                  {t('footer.freeConsultation')}
                </a>
              </li>
              <li>
                <a href="mailto:support@eraestate.com" className="hover:text-red-600 transition-colors inline-flex items-center group">
                  <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 group-hover:text-red-600" />
                  {t('footer.technicalSupport')}
                </a>
              </li>
              <li>
                <a href="mailto:info@eraestate.com" className="hover:text-red-600 transition-colors inline-flex items-center group">
                  <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 group-hover:text-red-600" />
                  {t('footer.contactEmail')}
                </a>
              </li>
              <li>
                <Link to="/help/wallet" className="hover:text-red-600 transition-colors inline-flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('footer.walletGuide')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-base">{t('footer.followUs')}</h3>
            
            {/* Social Media */}
            <div className="flex items-center gap-x-3 mb-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-600 flex items-center justify-center transition-all duration-200 group hover:scale-110 hover:-rotate-3"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-600 flex items-center justify-center transition-all duration-200 group hover:scale-110 hover:rotate-3"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-600 flex items-center justify-center transition-all duration-200 group hover:scale-110 hover:-rotate-3"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm text-gray-600 mb-3">{t('footer.newsletterTitle')}</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow duration-200"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 btn-press flex items-center justify-center"
                  aria-label={t('footer.subscribeButton')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-y-4 md:gap-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © {currentYear} Era Estate. {t('footer.allRightsReserved')}
            </p>

            {/* Additional Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <Link to="/legal?tab=terms" className="hover:text-red-600 transition-colors">
                {t('footer.terms')}
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/legal?tab=terms" className="hover:text-red-600 transition-colors">
                {t('footer.policy')}
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/contact" className="hover:text-red-600 transition-colors">
                {t('footer.contact')}
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/legal" className="hover:text-red-600 transition-colors">
                Trung tâm pháp lý
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/security" className="hover:text-red-600 transition-colors">
                Trung tâm bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
