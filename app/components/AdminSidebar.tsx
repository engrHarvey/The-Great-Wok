import React from 'react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="bg-background text-neutral w-64 p-8 space-y-8 shadow-lg h-screen">
      {/* Sidebar Title */}
      <h1 className="text-4xl font-extrabold mb-10 text-secondary tracking-wide text-center">
        Admin Panel
      </h1>

      {/* Navigation Links */}
      <nav className="space-y-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'users'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'dishes'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Dishes
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'categories'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Categories
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'inventory'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Inventory
        </button>
        {/* New Button for Order Items */}
        <button
          onClick={() => setActiveTab('order-items')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'order-items'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Order Items
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'orders'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Orders
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'reviews'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Reviews
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`block w-full text-left py-3 px-5 rounded-lg text-lg tracking-wide transition-colors duration-300 ease-in-out ${
            activeTab === 'payments'
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-dark text-neutral hover:text-white'
          }`}
        >
          Manage Payments
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
