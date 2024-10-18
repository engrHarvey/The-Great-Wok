"use client";

import React from 'react';
import Link from 'next/link';
import useCart from '../hooks/useCart';
import CartItemRow from '../components/CartItemRow';

const ShoppingCart: React.FC = () => {
  const { cartItems, error, updateCartItem, removeCartItem } = useCart();

  const handleIncreaseQuantity = (cart_item_id: number) => {
    const item = cartItems.find((item) => item.cart_item_id === cart_item_id);
    if (item) updateCartItem(cart_item_id, item.quantity + 1);
  };

  const handleDecreaseQuantity = (cart_item_id: number) => {
    const item = cartItems.find((item) => item.cart_item_id === cart_item_id);
    if (item && item.quantity > 1) updateCartItem(cart_item_id, item.quantity - 1);
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-4xl font-extrabold mb-8 text-primary">Shopping Cart</h2>

      {error && <p className="text-red-500">{error}</p>}

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>Your cart is empty!</p>
          <Link href="/menu" className="text-primary underline">
            Go back to Menu
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-6">
          <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-primary text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold text-lg">Dish Name</th>
                <th className="py-4 px-6 text-left font-semibold text-lg">Quantity</th>
                <th className="py-4 px-6 text-left font-semibold text-lg">Price</th>
                <th className="py-4 px-6 text-left font-semibold text-lg">Total</th>
                <th className="py-4 px-6 text-left font-semibold text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.cart_item_id}
                  item={item}
                  onIncrease={handleIncreaseQuantity}
                  onDecrease={handleDecreaseQuantity}
                  onRemove={removeCartItem}
                />
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-8">
            <Link
              href="/checkout"
              className="bg-accent text-white py-3 px-6 rounded-full hover:bg-secondary transition duration-300 ease-in-out shadow-md"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;