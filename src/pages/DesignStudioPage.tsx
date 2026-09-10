import React from 'react';
import { VisitingCardStudio } from '../components/VisitingCardStudio';
import { useApp } from '../context/AppContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const DesignStudioPage: React.FC = () => {
  const { isMarathi } = useApp();

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-3">
        <Breadcrumbs
          items={[
            { label: isMarathi ? 'मुख्यपृष्ठ' : 'Home', to: '/' },
            { label: isMarathi ? 'विझिटिंग कार्ड्स' : 'Visiting Cards', to: '/visiting-cards' },
            { label: isMarathi ? 'कार्ड डिझाईन स्टुडिओ' : 'Design Studio', active: true }
          ]}
        />
      </div>
      <VisitingCardStudio />
    </div>
  );
};
