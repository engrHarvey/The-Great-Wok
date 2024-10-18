import React from 'react';

interface Dish {
  dish_id: number;
  dish_name: string;
  description: string;
  price: number | string | null; // Ensure price can be number or string
  category_id: number;
  image_url: string;
  is_available: boolean;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface DishListProps {
  dishes: Dish[];
  categories: Category[]; // Add categories prop
  handleDishClick: (dish: Dish) => void;
}

const DishList: React.FC<DishListProps> = ({ dishes, categories, handleDishClick }) => {
  // Create a category lookup for quick access
  const categoryLookup: { [key: number]: string } = categories.reduce((acc, category) => {
    acc[category.category_id] = category.category_name;
    return acc;
  }, {} as { [key: number]: string });

  return (
    <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
  <thead className="bg-primary text-white">
    <tr>
      <th className="py-4 px-6 text-left font-semibold text-lg">Dish Name</th>
      <th className="py-4 px-6 text-left font-semibold text-lg">Category</th>
      <th className="py-4 px-6 text-left font-semibold text-lg">Price</th>
      <th className="py-4 px-6 text-left font-semibold text-lg">Available</th>
    </tr>
  </thead>
  <tbody>
    {dishes.map((dish) => (
      <tr
        key={dish.dish_id}
        className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out cursor-pointer"
        onClick={() => handleDishClick(dish)}
      >
        <td className="py-4 px-6 text-dark font-medium">{dish.dish_name.trim()}</td>
        <td className="py-4 px-6 text-gray-700">{categoryLookup[dish.category_id] || 'Unknown'}</td>
        <td className="py-4 px-6 text-primary font-semibold">₱{dish.price}</td>
        <td className="py-4 px-6">
          {dish.is_available ? (
            <span className="text-green-600 font-bold">Yes</span>
          ) : (
            <span className="text-red-600 font-bold">No</span>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
  );
};

export default DishList;
