import React from 'react';
import RentPage from './RentPage';
import RentHeroSection from '../components/rent/RentHeroSection';
import RentCategoryGrid from '../components/rent/RentCategoryGrid';
import RentTipsSection from '../components/rent/RentTipsSection';

const RentLandingPage: React.FC = () => {
  return (
    <div>
      <RentHeroSection />
      <RentCategoryGrid />
      <RentTipsSection />
      <RentPage />
    </div>
  );
};

export default RentLandingPage;

