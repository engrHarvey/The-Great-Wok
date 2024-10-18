import React, { useEffect, useState } from 'react';

interface Category {
  category_id: number;
  category_name: string;
}

const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from the backend
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories and handle loading and error states
  const fetchCategories = async () => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`); // Ensure correct URL
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`);
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle form submission to add a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Please enter a category name.');
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken'); // Retrieve JWT token from localStorage
      if (!token) {
        alert('You must be logged in as an admin to add a category.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token, // Include Authorization header
        },
        body: JSON.stringify({ category_name: newCategory.trim() }),
      });

      // Check if the response is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response is not JSON');
      }

      const addedCategory = await res.json();
      setCategories([...categories, addedCategory]); // Add new category to the state
      setNewCategory(''); // Clear input field
      alert('Category added successfully!');
    } catch (err) {
      console.error('Failed to add category', err);
      alert('An error occurred while adding the category.');
    }
  };

  return (
    <div className="p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-4xl font-extrabold mb-8 text-primary">Manage Categories</h2>

      {/* Form to add a new category */}
      <form onSubmit={handleAddCategory} className="mb-8">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category Name"
            className="flex-grow px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white shadow-sm"
            required
          />
          <button
            type="submit"
            className="bg-primary text-white py-3 px-6 rounded-full hover:bg-accent transition-all duration-200 ease-in-out shadow-md"
          >
            Add Category
          </button>
        </div>
      </form>

      {/* Display error message */}
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-6 text-center font-semibold">
          {error}
        </p>
      )}

      {/* Display loading state */}
      {isLoading ? (
        <p className="text-lg text-gray-500">Loading categories...</p>
      ) : (
        // Display existing categories
        <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-primary text-white">
            <tr>
              <th className="py-4 px-6 text-left font-semibold text-lg">Category ID</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Category Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-8 text-center text-gray-500 text-lg font-medium">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.category_id}
                  className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                >
                  <td className="py-4 px-6 text-gray-700">{category.category_id}</td>
                  <td className="py-4 px-6 text-dark font-medium">{category.category_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryTable;
