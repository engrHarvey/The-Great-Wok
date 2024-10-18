import { useState, useEffect } from 'react';

interface Category {
  category_id: number;
  category_name: string;
}

interface Dish {
  dish_id: number;
  dish_name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  is_available: boolean;
}

const useFetchData = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes`);
        if (!res.ok) throw new Error(`Failed to fetch dishes: ${res.statusText}`);
        const data = await res.json();
        setDishes(data);
      } catch (err) {
        setError('Failed to fetch dishes. Please try again later.');
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories. Please try again later.');
      }
    };

    fetchDishes();
    fetchCategories();
  }, []);

  return { dishes, categories, error };
};

export default useFetchData;