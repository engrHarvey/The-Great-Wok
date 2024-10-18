import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  cart_item_id: number;
  dish_id: number;
  dish_name: string;
  quantity: number;
  price: number;
}

const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCartItems = async () => {
    try {
      const token = getToken();
      const userId = getUserId();
      
      if (!token || !userId) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      } else {
        throw new Error('Failed to fetch cart items');
      }
    } catch (err) {
      setError('Failed to load cart items.');
      console.error(err);
    }
  };

  const updateCartItem = async (cart_item_id: number, quantity: number) => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/item/${cart_item_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.cart_item_id === cart_item_id ? { ...item, quantity } : item
          )
        );
      } else {
        throw new Error('Failed to update item quantity');
      }
    } catch (err) {
      setError('Failed to update item quantity.');
      console.error(err);
    }
  };

  const removeCartItem = async (cart_item_id: number) => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/item/${cart_item_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item.cart_item_id !== cart_item_id));
      } else {
        throw new Error('Failed to remove cart item');
      }
    } catch (err) {
      setError('Failed to remove cart item.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return { cartItems, error, updateCartItem, removeCartItem };
};

const getToken = () => localStorage.getItem('jwtToken');
const getUserId = () => localStorage.getItem('userId');

export default useCart;