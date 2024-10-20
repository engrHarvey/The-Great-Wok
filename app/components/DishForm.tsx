import React from 'react';

interface Category {
  category_id: number;
  category_name: string;
}

interface DishFormProps {
  newDish: {
    dish_name: string;
    description: string;
    price: string;
    category_id: string;
    image_url: string;
    is_available: boolean;
  };
  categories: Category[];
  imageFile: File | null; // eslint-disable-line @typescript-eslint/no-unused-vars
  setNewDish: React.Dispatch<React.SetStateAction<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleAddDish: (e: React.FormEvent) => Promise<void>;
  error: string | null;
}

const DishForm: React.FC<DishFormProps> = ({
  newDish,
  categories,
  imageFile, // eslint-disable-line @typescript-eslint/no-unused-vars
  setNewDish,
  setImageFile,
  handleAddDish,
  error,
}) => {
  return (
    <form onSubmit={handleAddDish} className="mb-8 p-6 bg-neutral-50 rounded-xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dish Name Field */}
        <input
          type="text"
          value={newDish.dish_name}
          onChange={(e) => setNewDish({ ...newDish, dish_name: e.target.value })}
          placeholder="Dish Name"
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          required
        />

        {/* Description Field */}
        <input
          type="text"
          value={newDish.description}
          onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
          placeholder="Description"
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white"
        />

        {/* Price Field */}
        <input
          type="number"
          step="0.01"
          value={newDish.price}
          onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
          placeholder="Price"
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          required
        />

        {/* Category Dropdown */}
        <select
          value={newDish.category_id}
          onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value })}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>

        {/* Image Upload Field */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white"
          required
        />

        {/* Availability Checkbox */}
        <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-4 focus-within:ring-primary bg-white">
          <input
            type="checkbox"
            checked={newDish.is_available}
            onChange={(e) => setNewDish({ ...newDish, is_available: e.target.checked })}
            className="mr-2"
          />
          Available
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-full hover:bg-accent transition-all duration-200 ease-in-out shadow-lg"
      >
        Add Dish
      </button>

      {/* Error Message */}
      {error && <p className="text-red-600 mt-4 text-center font-semibold">{error}</p>}
    </form>
  );
};

export default DishForm;
