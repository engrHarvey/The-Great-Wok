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
    <div className="container mx-auto p-4 sm:p-8">
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-primary">Shopping Cart</h2>

      {error && <p className="text-red-500">{error}</p>}

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="mb-4">Your cart is empty!</p>
          <Link href="/menu" className="text-primary underline text-sm sm:text-base">
            Go back to Menu
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden text-sm sm:text-base">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold">Dish Name</th>
                  <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold">Quantity</th>
                  <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold">Price</th>
                  <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold">Total</th>
                  <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold">Delete</th>
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
          </div>

          {/* Checkout Button */}
          <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
            <Link
              href="/checkout"
              className="bg-accent text-white py-3 px-6 w-full sm:w-auto text-center rounded-full hover:bg-secondary transition duration-300 ease-in-out shadow-md"
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