import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare, 
  Users, 
  Building2,
  CheckCircle,
  Facebook,
  Youtube,
  Linkedin
} from 'lucide-react';
import { useCreateInquiryNew } from '../api/hooks';
import toast from '../utils/toast';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // API Hook for creating inquiry
  const createInquiry = useCreateInquiryNew();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a general inquiry using the PropertyInquiry API
      await createInquiry.mutate({
        propertyId: 'GENERAL', // General contact form, not property-specific
        inquirerId: 'GUEST', // Guest user for contact form
        inquirerName: formData.name,
        inquirerEmail: formData.email,
        inquirerPhone: formData.phone,
        inquiryType: 'GENERAL_INFO',
        message: `Subject: ${formData.subject}\n\nMessage: ${formData.message}`,
        preferredContactMethod: 'EMAIL'
      });
      
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('G?i form li�n h? th?t b?i');
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.officeAddress'),
      details: [
        t('contact.floor12'),
        t('contact.street123'),
        t('contact.city')
      ]
    },
    {
      icon: Phone,
      title: t('contact.hotline'),
      details: [
        t('contact.freeConsultation'),
        t('contact.technicalSupportPhone'),
        t('contact.partnerPhone')
      ]
    },
    {
      icon: Mail,
      title: t('contact.email'),
      details: [
        'info@bdsportal.vn',
        'support@bdsportal.vn',
        'partner@bdsportal.vn'
      ]
    },
    {
      icon: Clock,
      title: t('contact.workingHours'),
      details: [
        t('contact.mondayToFriday'),
        t('contact.saturday'),
        t('contact.sunday')
      ]
    }
  ];

  const departments = [
    {
      name: t('contact.departments.customerSupport'),
      description: t('contact.departments.customerSupportDesc'),
      phone: '1900 1234',
      email: 'tuvan@bdsportal.vn'
    },
    {
      name: t('contact.departments.technicalSupport'),
      description: t('contact.departments.technicalSupportDesc'),
      phone: '028 3456 7890',
      email: 'support@bdsportal.vn'
    },
    {
      name: t('contact.departments.partnership'),
      description: t('contact.departments.partnershipDesc'),
      phone: '028 3456 7891',
      email: 'partner@bdsportal.vn'
    },
    {
      name: t('contact.departments.media'),
      description: t('contact.departments.mediaDesc'),
      phone: '028 3456 7892',
      email: 'media@bdsportal.vn'
    }
  ];

  const stats = [
    { icon: Users, value: '500K+', label: t('contact.stats.users') },
    { icon: Building2, value: '100K+', label: t('contact.stats.listings') },
    { icon: MessageSquare, value: '50K+', label: t('contact.stats.successfulConsultations') },
    { icon: CheckCircle, value: '98%', label: t('contact.stats.satisfaction') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {t('contact.heroDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Icon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.sendMessage')}</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('contact.form.successTitle')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('contact.form.successMessage')}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                >
                  {t('contact.form.sendNewMessage')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={t('contact.form.yourName')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={t('contact.form.yourEmail')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={t('contact.form.yourPhone')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.subject')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">{t('contact.form.selectSubject')}</option>
                      <option value="tuvan">{t('contact.form.subjects.propertyInquiry')}</option>
                      <option value="hotro">{t('contact.form.subjects.technicalSupport')}</option>
                      <option value="hoptac">{t('contact.form.subjects.partnership')}</option>
                      <option value="khac">{t('contact.form.subjects.other')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('contact.form.yourMessage')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.sendButton')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.contactInfo')}</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Theo Dõi Chúng Tôi</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Các Phòng Ban Hỗ Trợ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-gray-600 mb-4">{dept.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{dept.phone}</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{dept.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Vị Trí Văn Phòng
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Bản đồ Google Maps sẽ được tích hợp tại đây
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tầng 12, Tòa nhà ABC Tower, 123 Đường Lê Lợi, Quận 1, TP.HCM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;