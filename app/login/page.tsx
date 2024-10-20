'use client';

import React from 'react';
import Link from 'next/link';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  // Function to handle guest login
  const handleGuestLogin = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const { user, token } = await res.json();
        // Store guest token and user information in local storage
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userId', user.user_id);
        localStorage.setItem('role', user.role);

        // Redirect to the menu or homepage after guest login
        window.location.href = '/menu';
      } else {
        const errorData = await res.json();
        alert(`Failed to log in as guest: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error logging in as guest:', err);
      alert('Error logging in as guest. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white shadow-lg rounded-xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-primary">Welcome Back!</h1>

        {/* Login Form */}
        <AuthForm type="login" />

        {/* Additional Options */}
        <div className="mt-6 space-y-4">
          {/* Signup Button */}
          <Link href="/signup">
            <button className="w-full bg-secondary text-white py-2 sm:py-3 rounded-full shadow-md hover:bg-accent hover:shadow-lg transition-all duration-200 ease-in-out text-sm sm:text-base">
              New User? Sign Up
            </button>
          </Link>

          {/* Guest Login Button */}
          <button
            className="w-full bg-gray-500 text-white py-2 sm:py-3 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-200 ease-in-out text-sm sm:text-base"
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
