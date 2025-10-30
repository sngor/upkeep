import React from 'react';

interface DashboardProps {
  children: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
};
