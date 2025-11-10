import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Target, 
  Award, 
  Zap, 
  Shield, 
  Heart,
  Building2,
  TrendingUp,
  Star,
  CheckCircle,
  Quote
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  
  const stats = [
    { icon: Users, value: '500K+', label: t('about.stats.users'), color: 'text-blue-600' },
    { icon: Building2, value: '100K+', label: t('about.stats.properties'), color: 'text-green-600' },
    { icon: Award, value: '50K+', label: t('about.stats.transactions'), color: 'text-orange-600' },
    { icon: Star, value: '4.8/5', label: t('about.stats.rating'), color: 'text-yellow-500' }
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.coreValues.trust'),
      description: t('about.coreValues.trustDesc'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Zap,
      title: t('about.coreValues.speed'),
      description: t('about.coreValues.speedDesc'),
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Heart,
      title: t('about.coreValues.dedication'),
      description: t('about.coreValues.dedicationDesc'),
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Target,
      title: t('about.coreValues.innovation'),
      description: t('about.coreValues.innovationDesc'),
      color: 'bg-green-100 text-green-600'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn An',
      position: 'CEO & Founder',
      image: 'https://via.placeholder.com/200x200?text=CEO',
      description: 'Hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản và công nghệ.',
    },
    {
      name: 'Trần Thị Bình',
      position: 'CTO',
      image: 'https://via.placeholder.com/200x200?text=CTO',
      description: 'Chuyên gia công nghệ với kinh nghiệm phát triển các platform quy mô lớn.',
    },
    {
      name: 'Lê Văn Cường',
      position: 'Head of Sales',
      image: 'https://via.placeholder.com/200x200?text=Sales',
      description: 'Dẫn dắt đội ngũ kinh doanh với hơn 10 năm kinh nghiệm BDS.',
    },
    {
      name: 'Phạm Thị Dung',
      position: 'Head of Marketing',
      image: 'https://via.placeholder.com/200x200?text=Marketing',
      description: 'Chuyên gia marketing với nhiều chiến dịch thành công trong ngành BDS.',
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Thành lập BDSPortal',
      description: 'Ra mắt với tầm nhìn trở thành nền tảng BDS hàng đầu Việt Nam.'
    },
    {
      year: '2019',
      title: 'Mở rộng toàn quốc',
      description: 'Phủ sóng 63 tỉnh thành với hơn 10,000 tin đăng.'
    },
    {
      year: '2020',
      title: 'Ra mắt ứng dụng mobile',
      description: 'Ứng dụng di động với hơn 100,000 lượt tải xuống.'
    },
    {
      year: '2021',
      title: 'Tích hợp AI & Big Data',
      description: 'Áp dụng trí tuệ nhân tạo để định giá và tư vấn BDS.'
    },
    {
      year: '2022',
      title: 'Đạt 500K người dùng',
      description: 'Cột mốc quan trọng với hơn 500,000 người dùng tin tưởng.'
    },
    {
      year: '2024',
      title: 'Dẫn đầu thị trường',
      description: 'Trở thành nền tảng BDS số 1 Việt Nam về lượng truy cập.'
    }
  ];

  const testimonials = [
    {
      name: 'Anh Minh Tuấn',
      position: 'Khách hàng',
      content: 'BDSPortal giúp tôi tìm được căn nhà mơ ước chỉ trong 2 tuần. Thông tin chính xác, hỗ trợ tận tình.',
      rating: 5
    },
    {
      name: 'Chị Lan Anh',
      position: 'Môi giới BDS',
      content: 'Nền tảng tuyệt vời cho môi giới. Giao diện thân thiện, nhiều khách hàng tiềm năng.',
      rating: 5
    },
    {
      name: 'Anh Đức Thắng',
      position: 'Nhà đầu tư',
      content: 'Công cụ phân tích thị trường rất hữu ích cho việc đầu tư BDS. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              {t('about.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">6+</div>
                <div className="text-sm opacity-90">{t('about.yearsActive')}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">63</div>
                <div className="text-sm opacity-90">{t('about.provinces')}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-90">{t('about.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('about.mission')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('about.missionDesc')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('about.vision')}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t('about.visionDesc')}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.values')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                  <div className={`inline-flex p-4 rounded-full ${value.color} mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.timeline')}
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-orange-200"></div>
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              } mb-8`}>
                <div className={`bg-white rounded-lg shadow-sm p-6 max-w-md ${
                  index % 2 === 0 ? 'mr-8' : 'ml-8'
                }`}>
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {milestone.year}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 border-4 border-white rounded-full shadow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.team')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.testimonials')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 relative">
                <Quote className="w-8 h-8 text-orange-200 absolute top-4 right-4" />
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.position}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('about.awards')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.award1Title')}
              </h3>
              <p className="text-gray-600">{t('about.award1Desc')}</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.award2Title')}
              </h3>
              <p className="text-gray-600">{t('about.award2Desc')}</p>
            </div>
            <div className="text-center">
              <Star className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.award3Title')}
              </h3>
              <p className="text-gray-600">{t('about.award3Desc')}</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('about.joinUs')}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('about.joinUsDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {t('about.registerNow')}
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              {t('about.learnMore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;