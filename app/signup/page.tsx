import React from 'react';
import AuthForm from '../components/AuthForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-2xl text-center">
        <h1 className="text-5xl font-extrabold mb-10 text-primary">Create an Account</h1>

        {/* Sign-Up Form */}
        <AuthForm type="signup" />
      </div>
    </div>
  );
}
