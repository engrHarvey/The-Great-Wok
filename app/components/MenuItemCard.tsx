import React from 'react';
import Image from 'next/image';

interface MenuItemProps {
  dish_name: string;
  description: string;
  price: number | string | null;
  image_url: string;
  onAddToCart: () => void;
}

const MenuItemCard: React.FC<MenuItemProps> = ({ dish_name, description, price, image_url, onAddToCart }) => {
  const displayPrice = typeof price === 'number' ? price.toFixed(2) : parseFloat(price || '0').toFixed(2);

  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out bg-white transform hover:-translate-y-1">
      {/* Image Component with priority attribute */}
      <div className="relative w-full h-48 mb-4 rounded-t-lg shadow-sm">
        <Image
          src={image_url || '/default-dish.png'} // Fallback to a default image if URL is missing
          alt={dish_name}
          fill // Use fill to make the image cover its container
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-lg"
          style={{ objectFit: 'cover' }} // Use style prop for objectFit
          priority // Add priority for above-the-fold images
        />
      </div>

      <div className="px-4 py-2">
        <h3 className="text-2xl font-extrabold text-dark mb-2">{dish_name}</h3>
        <p className="mb-4 text-gray-600">{description}</p>
        <p className="text-xl text-primary font-semibold">₱{displayPrice}</p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={onAddToCart}
        className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-secondary hover:text-dark transition duration-200 ease-in-out shadow-md"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default MenuItemCard;
