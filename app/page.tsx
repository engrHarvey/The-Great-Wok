"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Dish {
  dish_id: number;
  dish_name: string;
  description: string;
  image_url: string;
  category_name: string; // For filtering, if necessary
}

export default function Home() {
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch featured dishes when the component mounts
  useEffect(() => {
    fetchFeaturedDishes();
  }, []);
  
  const fetchFeaturedDishes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes`);
      if (!res.ok) throw new Error(`Failed to fetch dishes: ${res.statusText}`);
      const data = await res.json();
      console.log("Fetched All Dishes: ", data);
      setFeaturedDishes(data);
    } catch (err) {
      console.error("Error fetching all dishes:", err);
    } finally {
      setLoading(false);  // Ensure loading is set to false
    }
  };

  // Filter dishes to display only "Peking Duck", "Pata Tim", and "Lechon Macau"
  const filteredDishes = featuredDishes.filter(dish =>
    ["Peking Duck", "Pata Tim", "Lechon Macau"].includes(dish.dish_name)
  );

  return (
    <main className="min-h-screen">
  {/* Restaurant Logo Section */}
  <section className="flex justify-center items-center py-8 md:py-12 bg-gray-50">
    <Image
      src="/logo.png"
      alt="The Great Wok Logo"
      width={192}  // Adjust width for small screens
      height={192}  // Adjust height for small screens
      className="object-contain shadow-lg transition duration-500 transform hover:scale-105"
      priority
    />
  </section>

  {/* Hero Header Section */}
  <header
    className="relative h-80 md:h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/restaurant.jpeg')" }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-secondary opacity-80"></div>
    <div className="relative h-full flex items-center justify-center text-center px-4 md:px-8">
      <div>
        <h1 className="text-4xl md:text-6xl text-white font-bold mb-4 drop-shadow-lg">
          Welcome to The Great Wok
        </h1>
        <p className="text-base md:text-xl text-gray-100 mb-6 md:mb-8">
          Discover a Fusion of Authentic Asian Cuisine and Modern Culinary Art.
        </p>
        <a
          href="#our-story"
          className="bg-secondary text-white px-5 py-2 md:px-6 md:py-3 rounded-full text-base md:text-lg font-medium shadow-md hover:bg-accent transition duration-300"
        >
          Learn More About Us
        </a>
      </div>
    </div>
  </header>

  {/* Our Story Section */}
  <section id="our-story" className="p-6 md:p-12 bg-white text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Our Story</h2>
    <p className="text-base md:text-lg max-w-3xl mx-auto mb-4 md:mb-6">
      At The Great Wok, our story is rooted in family traditions and a love for Asian cuisine. 
      We started as a small kitchen in the heart of the city, and over the years, our passion 
      has grown into a place where food enthusiasts can gather to experience authentic dishes 
      crafted with fresh ingredients, bold flavors, and a touch of innovation.
    </p>
  </section>

  {/* Featured Dishes Section */}
  <section className="bg-gray-100 py-12 md:py-16">
    <div className="text-center mb-8 md:mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Signature Dishes</h2>
      <p className="text-base md:text-lg text-neutral max-w-3xl mx-auto">
        Taste the essence of Asia with our curated selection of signature dishes, crafted
        with fresh, locally-sourced ingredients and infused with authentic flavors.
      </p>
    </div>

    {/* Display Dishes Grid */}
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
      {/* Check for Loading State */}
      {loading ? (
        <p className="text-center col-span-full text-lg">Loading...</p>
      ) : (
        filteredDishes.length > 0 ? (
          filteredDishes.map((dish) => (
            <div
              key={dish.dish_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
            >
              {/* Image Container */}
              <div className="relative w-full h-48 sm:h-64 rounded-t-lg overflow-hidden">
                <Image
                  src={dish.image_url || '/default-dish.png'}
                  alt={dish.dish_name || 'Dish Image'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg"
                  priority
                />
              </div>

              {/* Dish Info Container */}
              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-dark">
                  {dish.dish_name || 'Unnamed Dish'}
                </h3>
                <p className="text-sm md:text-base text-gray-700">
                  {dish.description ? dish.description : 'No description available'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-lg">No featured dishes to display.</p>
        )
      )}
    </div>
  </section>
</main>
  );
}
