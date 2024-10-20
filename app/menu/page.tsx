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
      const data: Dish[] = await res.json();

      const formattedDishes = data.map((item) => ({
        ...item,
        price: parseFloat(item.price.toString()) || 0, // Ensure price is a float
      }));

      // Sort dishes alphabetically by dish_name
      const sortedDishes = formattedDishes.sort((a, b) =>
        a.dish_name.localeCompare(b.dish_name)
      );

      setMenuItems(sortedDishes);
      setFilteredItems(sortedDishes);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleAddToCart = async (item: Dish) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const storedUserId = localStorage.getItem('userId');

      if (!token || !storedUserId) {
        alert('You must log in to add items to the cart.');
        router.push('/login');
        return;
      }

      const userId = parseInt(storedUserId, 10);
      if (isNaN(userId) || userId <= 0) {
        console.error('Invalid user ID:', storedUserId);
        throw new Error('Invalid user ID');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          dish_id: item.dish_id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to add item to cart: ${response.statusText}`);
      }

      const result = await response.json();
      alert(`${item.dish_name} has been added to your cart!`);
      console.log('Cart item added:', result);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  return (
    <main className="bg-background text-secondary min-h-screen">
      {/* Header */}
      <header className="bg-dark py-12 sm:py-16 shadow-lg mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary text-center drop-shadow-lg">
          Our Menu
        </h1>
        <p className="text-center text-base sm:text-lg text-neutral mt-4 max-w-lg sm:max-w-3xl mx-auto">
          Explore our carefully curated selection of authentic Asian dishes, each crafted to bring a delightful burst of flavors.
        </p>
      </header>

      <div className="p-6 sm:p-10 md:p-12 lg:p-16 max-w-7xl mx-auto">
        {/* Search and Filter Component */}
        <SearchAndFilter
          items={menuItems}
          categories={categories}
          onFilter={setFilteredItems}
          searchField="dish_name"
        />

        {/* Menu Items Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mt-8 sm:mt-12">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.dish_id}
              dish_name={item.dish_name}
              description={item.description}
              price={item.price}
              image_url={item.image_url}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </section>
      </div>
    </main>
  );
};

export default Menu;
