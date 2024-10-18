'use client'; // Enable Client Component features

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import UserTable from '../components/UserTable';
import OrderTable from '../components/OrderTable';
import DishTable from '../components/DishTable';
import CategoryTable from '../components/CategoryTable';
import InventoryTable from '../components/InventoryTable';
import ReviewTable from '../components/ReviewTable';
import PaymentTable from '../components/PaymentTable';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users'); // State for current active tab
  const [isLoading, setIsLoading] = useState(true); // State to manage loading state
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated and has an admin role
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('role'); // Assuming `role` is stored on login

    if (!token || role !== 'admin') {
      // Redirect non-admin users to the homepage
      router.push('/');
    } else {
      setIsLoading(false); // Allow access to the admin dashboard
    }
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Component for Navigation */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100">
        {/* Admin Header */}
        <AdminHeader title="Admin Dashboard" />

        {/* Dynamic Content Based on Active Tab */}
        <div className="p-8">
          {activeTab === 'users' && <UserTable />}
          {activeTab === 'orders' && <OrderTable />}
          {activeTab === 'dishes' && <DishTable />}
          {activeTab === 'categories' && <CategoryTable />}
          {activeTab === 'inventory' && <InventoryTable />}
          {activeTab === 'reviews' && <ReviewTable />}
          {activeTab === 'payments' && <PaymentTable />}
        </div>
      </div>
    </div>
  );
}
