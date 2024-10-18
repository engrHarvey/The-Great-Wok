'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [cartCount, setCartCount] = useState(0); // State to manage cart count
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`, {
            headers: {
              Authorization: `${token}`,
            },
          });

          if (res.ok) {
            const { user } = await res.json();
            setIsAuthenticated(true);
            setUsername(user.username);
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
          setIsAuthenticated(false);
        }
      }
    };

    fetchUserProfile();

    // Fetch Cart Items and Update Count
    const fetchCartItems = () => {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        setCartCount(cartItems.length);
      }
    };

    fetchCartItems();

    // Listen for changes to the cart in other tabs/windows and update count accordingly
    const updateCartCount = () => {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        setCartCount(cartItems.length);
      } else {
        setCartCount(0);
      }
    };

    window.addEventListener('storage', updateCartCount);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
    }
    setIsAuthenticated(false);
    setUsername('');
    router.push('/'); // Redirect to homepage
  };

  // Handle Cart Icon Click
  const handleCartClick = () => {
    if (isAuthenticated) {
      router.push('/cart'); // If logged in, navigate to cart
    } else {
      router.push('/login'); // If not logged in, navigate to login
    }
  };

  return (
    <nav className="bg-primary text-neutral p-6 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left Section: Logo + Navigation Links */}
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          {/* Logo */}
          <img
            src="/logo-header.png"
            alt="Great Wok Logo"
            className="h-16 w-auto md:h-20" // Adjusted height for better scaling
          />

          {/* Navigation Links: Home & Menu */}
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-accent transition duration-300 ease-in-out text-lg">
              Home
            </Link>
            <Link href="/menu" className="hover:text-accent transition duration-300 ease-in-out text-lg">
              Menu
            </Link>
          </div>
        </div>

        {/* Right Section: Cart Icon + Authentication Links */}
        <div className="flex items-center justify-center md:justify-end space-x-6">
          {/* Cart Icon with Conditional Navigation */}
          <button
            onClick={handleCartClick}
            className="relative flex items-center text-white text-lg focus:outline-none"
            aria-label="Cart"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Authentication Links */}
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="mx-3 my-2 md:my-0 bg-accent text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 ease-in-out text-lg"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Make the Username Clickable */}
              <Link href="/profile" className="text-lg mx-2 text-white font-semibold hover:underline">
                {`Welcome, ${username}`}
              </Link>
              <button
                onClick={handleLogout}
                className="mx-3 my-2 md:my-0 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-500 transition duration-300 ease-in-out text-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
