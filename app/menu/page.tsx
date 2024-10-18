"use client";

import React, { useEffect, useState } from "react";
import MenuItemCard from "../components/MenuItemCard";
import SearchAndFilter from "../components/SearchAndFilter";
import { useRouter } from "next/navigation";

interface Dish {
  dish_id: number;
  dish_name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
}

interface Category {
  category_id: number;
  category_name: string;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [filteredItems, setFilteredItems] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes`);
      if (!res.ok) throw new Error(`Failed to fetch menu items: ${res.statusText}`);
      const data = await res.json();
      const formattedDishes = data.map((item: any) => ({
        ...item,
        price: parseFloat(item.price) || 0,
      }));
      setMenuItems(formattedDishes);
      setFilteredItems(formattedDishes);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleAddToCart = async (item: Dish) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const storedUserId = localStorage.getItem('userId');
  
      // Ensure the user is logged in and the userId exists
      if (!token || !storedUserId) {
        alert('You must log in to add items to the cart.');
        router.push('/login');
        return;
      }
  
      // Parse userId as an integer
      const userId = parseInt(storedUserId, 10);
      if (isNaN(userId) || userId <= 0) {
        console.error('Invalid user ID:', storedUserId); // Log the invalid user ID
        throw new Error('Invalid user ID');
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId, // Pass user_id as a positive integer
          dish_id: item.dish_id, // Ensure dish_id is an integer
          quantity: 1, // Default quantity of 1 when adding to cart
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData); // Log error response for debugging
        throw new Error(`Failed to add item to cart: ${response.statusText}`);
      }
  
      const result = await response.json();
      alert(`${item.dish_name} has been added to your cart!`);
      console.log('Cart item added:', result); // Log the result for debugging
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };      

  return (
    <main className="bg-background text-secondary min-h-screen">
      {/* Header */}
      <header className="bg-dark py-16 shadow-lg mb-8">
        <h1 className="text-6xl font-extrabold text-primary text-center drop-shadow-lg">
          Our Menu
        </h1>
        <p className="text-center text-xl text-neutral mt-4 max-w-3xl mx-auto">
          Explore our carefully curated selection of authentic Asian dishes, each crafted to bring a delightful burst of flavors.
        </p>
      </header>

      <div className="p-10 md:p-12 lg:p-16 max-w-7xl mx-auto">
        {/* Search and Filter Component */}
        <SearchAndFilter
          items={menuItems}
          categories={categories}
          onFilter={setFilteredItems}
          searchField="dish_name"
        />

        {/* Menu Items Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.dish_id}
              dish_name={item.dish_name}
              description={item.description}
              price={item.price}
              image_url={item.image_url}
              onAddToCart={() => handleAddToCart(item)} // Pass the add to cart handler
            />
          ))}
        </section>
      </div>
    </main>
  );
};

export default Menu;
