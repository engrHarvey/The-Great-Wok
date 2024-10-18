'use client';

import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import AddressForm from '../components/AddressForm';

interface UserProfile {
  username: string;
  email: string;
  phone?: string;
}

interface Address {
  address_id: number;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    address_id: 0,
    address_line: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });
  const [loading, setLoading] = useState<boolean>(false);  
  const [error, setError] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState<boolean>(false);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);  // ID of address being edited

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('User is not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          setPhone(user.phone);
        } else {
          setError('Failed to fetch profile data.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAddresses = async () => {
      const token = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError('User is not authenticated.');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/addresses/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
        } else {
          setError('Failed to fetch addresses.');
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load addresses.');
      }
    };

    fetchUserProfile();
    fetchUserAddresses();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handlePhoneEdit = async () => {
    const token = localStorage.getItem('jwtToken');
    console.log('Token:', token);  // Log token to ensure it's valid
    if (!token) {
      setError('User is not authenticated.');
      return;
    }
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // Ensure Bearer is present
        },
        body: JSON.stringify({ phone }),
      });
  
      if (res.ok) {
        setEditingPhone(false);
        alert('Phone number updated successfully!');
      } else {
        setError('Failed to update phone number.');
      }
    } catch (err) {
      console.error('Error updating phone number:', err);
      setError('Failed to update phone number.');
    }
  };    

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('User is not authenticated.');
      return;
    }

    const method = editingAddress ? 'PUT' : 'POST';
    const endpoint = editingAddress
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${editingAddress}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newAddress, user_id: parseInt(userId, 10) }),
      });

      if (res.ok) {
        const addedOrUpdatedAddress = await res.json();
        if (editingAddress) {
          setAddresses((prev) =>
            prev.map((address) => (address.address_id === editingAddress ? addedOrUpdatedAddress : address))
          );
        } else {
          setAddresses((prev) => [...prev, addedOrUpdatedAddress]);
        }
        setEditingAddress(null);
        setNewAddress({
          address_id: 0,
          address_line: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
        });
        alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      } else {
        setError(editingAddress ? 'Failed to update address.' : 'Failed to add address.');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(address);
    setEditingAddress(address.address_id);
  };

  const handleDeleteAddress = async (address_id: number) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setError('User is not authenticated.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${address_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAddresses(addresses.filter((address) => address.address_id !== address_id));
        alert('Address deleted successfully!');
      } else {
        setError('Failed to delete address.');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address.');
    }
  };

  if (error) {
    return <div className="container mx-auto p-8">{error}</div>;
  }

  if (loading || !user) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-5xl font-extrabold mb-12 text-primary">Profile</h2>

      {/* User Info */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-12">
        <p className="text-2xl font-semibold text-gray-800 mb-4">Username: {user.username}</p>
        <p className="text-2xl font-semibold text-gray-800 mb-4">Email: {user.email}</p>

        <div className="flex items-center mb-4">
          {editingPhone ? (
            <>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                className="border border-gray-300 px-4 py-2 rounded-lg text-lg w-2/3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={handlePhoneEdit}
                  className="bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-all duration-200 ease-in-out"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPhone(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-gray-800">Phone: {phone}</p>
              <button
                onClick={() => setEditingPhone(true)}
                className="ml-4 bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-all duration-200 ease-in-out flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-1" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Address Form */}
      <AddressForm
        newAddress={newAddress}
        onAddressChange={handleAddressChange}
        onAddAddress={handleAddOrUpdateAddress}
      />

      {/* Address List */}
      <div className="bg-white shadow-xl rounded-xl p-8 mt-12">
        <h3 className="text-3xl font-bold text-secondary mb-6">Your Addresses</h3>
        {addresses.length === 0 ? (
          <p className="text-lg text-gray-600">No addresses added yet.</p>
        ) : (
          <ul className="space-y-6">
            {addresses.map((address) => (
              <li key={address.address_id} className="text-lg font-medium text-gray-800 flex justify-between items-center">
                <div>
                  {address.address_line}, {address.city}, {address.state}, {address.country}, {address.postal_code}
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-200 flex items-center"
                  >
                    <PencilIcon className="h-5 w-5 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.address_id)}
                    className="text-red-500 hover:text-red-700 font-semibold transition-colors duration-200 flex items-center"
                  >
                    <TrashIcon className="h-5 w-5 mr-1" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
