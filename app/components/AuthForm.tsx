'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  type: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [repeatPassword, setRepeatPassword] = useState(''); // State for repeat password
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle repeat password field changes
  const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  };

  // Submit form data to the backend
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');

  // Check if passwords match for signup
  if (type === 'signup' && form.password !== repeatPassword) {
    setError('Passwords do not match. Please try again.');
    return;
  }

  // Email validation
  if (!form.email.trim()) {
    setError('Email is required.');
    return;
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = type === 'signup' ? `${backendUrl}/api/users` : `${backendUrl}/api/login`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const { user, token } = await res.json();

      // Store the token, username, and userId in localStorage
      if (type === 'login' && typeof window !== 'undefined') {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userId', user.user_id); // Store user ID in localStorage
        localStorage.setItem('username', user.username); // Save username in localStorage
        localStorage.setItem('role', user.role); // Save role in localStorage for admin checks
      }      

      alert(type === 'signup' ? 'User registered successfully! Please login.' : 'Login successful!');

      if (type === 'signup') {
        router.push('/login');
      } else {
        const userRole = user.role;
        if (userRole === 'admin') {
          window.location.href = '/admin'; // Redirect to admin dashboard for admins
        } else {
          window.location.href = '/menu'; // Redirect to menu for regular users
        }
      }
    } else {
      const errorData = await res.json();
      setError(errorData.error || 'An error occurred. Please try again.');
    }
  } catch (err) {
    setError('Internal server error. Please try again.');
    console.error('Request failed:', err);
  }
};

  return (
    <div className="bg-white p-6 sm:p-10 shadow-2xl rounded-xl max-w-xs sm:max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Username Field for Signup */}
        {type === 'signup' && (
          <div className="mb-4 sm:mb-6">
            <label htmlFor="username" className="block text-base sm:text-lg font-bold mb-2 text-primary">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-secondary bg-white shadow-sm text-sm sm:text-base"
              required
            />
          </div>
        )}

        {/* Email Field */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="email" className="block text-base sm:text-lg font-bold mb-2 text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-secondary bg-white shadow-sm text-sm sm:text-base"
            required
          />
        </div>

        {/* Phone Field for Signup */}
        {type === 'signup' && (
          <div className="mb-4 sm:mb-6">
            <label htmlFor="phone" className="block text-base sm:text-lg font-bold mb-2 text-primary">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-secondary bg-white shadow-sm text-sm sm:text-base"
              required
            />
          </div>
        )}

        {/* Password Field */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="password" className="block text-base sm:text-lg font-bold mb-2 text-primary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-secondary bg-white shadow-sm text-sm sm:text-base"
            required
          />
        </div>

        {/* Repeat Password Field for Signup */}
        {type === 'signup' && (
          <div className="mb-4 sm:mb-6">
            <label htmlFor="repeatPassword" className="block text-base sm:text-lg font-bold mb-2 text-primary">
              Repeat Password
            </label>
            <input
              id="repeatPassword"
              name="repeatPassword"
              type="password"
              value={repeatPassword}
              onChange={handleRepeatPasswordChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-secondary bg-white shadow-sm text-sm sm:text-base"
              required
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6 text-center font-semibold text-sm sm:text-base">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 sm:py-4 rounded-full hover:bg-accent transition-all duration-200 ease-in-out shadow-md text-sm sm:text-base"
        >
          {type === 'signup' ? 'Sign Up' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
