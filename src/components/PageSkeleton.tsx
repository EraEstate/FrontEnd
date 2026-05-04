import React from 'react';
import { Loader2 } from 'lucide-react';

const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <div className="text-gray-500 font-medium">Loading page...</div>
    </div>
  );
};

export default PageSkeleton;
