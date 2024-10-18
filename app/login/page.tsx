'use client'; // Add this directive at the top to enable client-side interactivity

import React from 'react';
import Link from 'next/link';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  // Function to handle guest login (you can update this with actual logic)
  const handleGuestLogin = () => {
    alert('Logged in as Guest!');
    // Implement guest session creation or redirection as needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl text-center">
        <h1 className="text-5xl font-extrabold mb-10 text-primary">Welcome Back!</h1>

        {/* Login Form */}
        <AuthForm type="login" />

        {/* Additional Options */}
        <div className="mt-8 space-y-6">
          {/* Signup Button */}
          <Link href="/signup">
            <button className="w-full bg-secondary text-white py-3 rounded-full shadow-md hover:bg-accent hover:shadow-lg transition-all duration-200 ease-in-out">
              New User? Sign Up
            </button>
          </Link>

          {/* Guest Login Button */}
          <button
            className="w-full bg-gray-500 text-white py-3 rounded-full shadow-md hover:bg-gray-700 hover:shadow-lg transition-all duration-200 ease-in-out"
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
