"use client";

import React, { useState, useEffect } from 'react';
import useCart from '../hooks/useCart';

interface Address {
  address_id: number;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

const Checkout: React.FC = () => {
  const { cartItems, setCartItems } = useCart(); // Access setCartItems to clear cart in the UI
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's addresses
  useEffect(() => {
    const fetchAddresses = async () => {
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
          throw new Error('Failed to fetch addresses.');
        }
      } catch (err) {
        setError('Error fetching addresses.');
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select an address for delivery.');
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      alert('You need to log in to place an order.');
      return;
    }

    const total_price = cartItems.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0).toFixed(2);

    const orderPayload = {
      user_id: parseInt(userId, 10),
      total_price: total_price,
      address_id: selectedAddress,
      cart_items: cartItems.map((item) => ({
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      // Place the order
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        alert('Order placed successfully!');

        // Clear the cart in the UI
        setCartItems([]);

        // Clear the cart in the database
        const clearCartRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (clearCartRes.ok) {
          console.log('Cart cleared from the database.');
        } else {
          const errorData = await clearCartRes.json();
          console.error(`Failed to clear cart: ${errorData.error || 'Unknown error'}`);
        }

        console.log("Order placed for:", orderPayload);
      } else {
        const errorData = await res.json();
        alert(`Failed to place order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Error placing order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-primary text-center">Checkout</h2>

      {/* Cart Summary */}
      <div className="mb-6 p-4 sm:p-6 bg-white shadow-md rounded-lg">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">Order Summary</h3>
        <ul className="list-none space-y-4">
          {cartItems.map((item) => (
            <li key={item.cart_item_id} className="flex flex-col sm:flex-row justify-between text-base sm:text-lg text-gray-700">
              <span className="flex-1">{item.dish_name} - {item.quantity} x ₱{Number(item.price || 0).toFixed(2)}</span>
              <span className="text-right font-semibold">₱{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-extrabold text-right text-gray-900">
          Total: ₱{cartItems.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0).toFixed(2)}
        </p>
      </div>

      {/* Address Selection */}
      <div className="mb-6 p-4 sm:p-6 bg-white shadow-md rounded-lg">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">Select Delivery Address</h3>
        {error && <p className="text-red-500">{error}</p>}
        {addresses.length === 0 ? (
          <p className="text-base sm:text-lg text-gray-600">No saved addresses. Please add one in your profile.</p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((address) => (
              <li key={address.address_id} className="flex items-center bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm hover:bg-gray-100 transition">
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="radio"
                    name="address"
                    value={address.address_id}
                    checked={selectedAddress === address.address_id}
                    onChange={() => setSelectedAddress(address.address_id)}
                    className="form-radio h-5 w-5 text-primary focus:ring-primary transition duration-150 ease-in-out mr-3 sm:mr-4"
                  />
                  <span className="text-gray-700 text-sm sm:text-base">
                    {address.address_line}, {address.city}, {address.state}, {address.country}, {address.postal_code}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Place Order Button */}
      <div className="text-center sm:text-right">
        <button
          onClick={handlePlaceOrder}
          className="bg-primary text-white py-3 px-6 sm:px-10 rounded-full hover:bg-secondary transition-all duration-300 ease-in-out shadow-md text-base sm:text-lg font-semibold w-full sm:w-auto"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
