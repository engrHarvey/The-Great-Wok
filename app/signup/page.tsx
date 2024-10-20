import React from 'react';
import AuthForm from '../components/AuthForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-lg p-6 sm:p-8 bg-white shadow-xl rounded-xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-primary">
          Create an Account
        </h1>

        {/* Sign-Up Form */}
        <AuthForm type="signup" />
      </div>
    </div>
  );
}
