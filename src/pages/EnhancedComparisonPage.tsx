import React from 'react';
import PropertyComparisonPage from './PropertyComparisonPage';
import ComparisonChart from '../components/compare/ComparisonChart';
import SimilarSuggestions from '../components/compare/SimilarSuggestions';

const EnhancedComparisonPage: React.FC = () => {
  return (
    <div>
      <PropertyComparisonPage />
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <ComparisonChart />
        <SimilarSuggestions />
      </div>
    </div>
  );
};

export default EnhancedComparisonPage;

