import React from 'react';

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow p-4">
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
    </header>
  );
};

export default AdminHeader;
