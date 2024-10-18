'use client';

import React, { useState } from 'react';
import DishForm from './DishForm';
import DishList from './DishList';
import useFetchData from '../hooks/useFetchData';
import { uploadImageToServer } from '../utils/uploadImage';
import Modal from './Modal'; // Import the reusable Modal component

const DishTable: React.FC = () => {
  const { dishes, categories, error: fetchError } = useFetchData();
  const [newDish, setNewDish] = useState({
    dish_name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any>(null);

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const uploadedImageUrl = await uploadImageToServer(imageFile);
    if (!uploadedImageUrl) return;

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('User is not authenticated.');
        return;
      }

      const authHeader = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          ...newDish,
          image_url: uploadedImageUrl,
          price: parseFloat(newDish.price),
          category_id: parseInt(newDish.category_id),
        }),
      });

      if (res.ok) {
        alert('Dish added successfully!');
        setNewDish({
          dish_name: '',
          description: '',
          price: '',
          category_id: '',
          image_url: '',
          is_available: true,
        });
        setImageFile(null);
      } else {
        const errorData = await res.json();
        setError(`Failed to add dish: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to add dish', err);
      setError('An error occurred while adding the dish.');
    }
  };

  // Handle the click event to open the edit modal
  const handleDishClick = (dish: any) => {
    console.log('Selected Dish Data:', dish); // Debug log to see the entire dish object
    if (!dish.dish_id) {
      setError('Dish ID is missing for the selected dish. Please check the dish data.');
      return;
    }
    setSelectedDish(dish); // Set the entire dish object, including its ID
    setIsEditModalOpen(true);
  };

  const handleSaveDish = async () => {
    if (!selectedDish || !selectedDish.dish_id) {
      setError('Selected dish has no valid ID. Please try again.');
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const authHeader = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes/${selectedDish.dish_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(selectedDish),
      });

      if (res.ok) {
        alert('Dish updated successfully!');
        setIsEditModalOpen(false);
      } else {
        const errorData = await res.json();
        setError(`Failed to update dish: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to update dish', err);
    }
  };

  const handleDeleteDish = async () => {
    if (!selectedDish || !selectedDish.dish_id) {
      setError('Selected dish has no valid ID. Please try again.');
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const authHeader = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes/${selectedDish.dish_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
        },
      });

      if (res.ok) {
        alert('Dish deleted successfully!');
        setIsEditModalOpen(false);
      } else {
        const errorData = await res.json();
        setError(`Failed to delete dish: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to delete dish', err);
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl">
  <h2 className="text-4xl font-bold mb-8 text-primary">Manage Dishes</h2>

  {/* Form Component */}
  <DishForm
    newDish={newDish}
    categories={categories}
    imageFile={imageFile}
    setNewDish={setNewDish}
    setImageFile={setImageFile}
    handleAddDish={handleAddDish}
    error={error || fetchError}
  />

  {/* Dish List Component */}
  <DishList dishes={dishes} handleDishClick={handleDishClick} categories={categories} />

  {/* Edit Dish Modal */}
  <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Dish">
    {selectedDish && (
      <div className="p-6 bg-neutral-100 rounded-lg">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Dish Name</label>
          <input
            type="text"
            value={selectedDish.dish_name}
            onChange={(e) => setSelectedDish({ ...selectedDish, dish_name: e.target.value.trim() })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Price</label>
          <input
            type="number"
            value={selectedDish.price}
            onChange={(e) => setSelectedDish({ ...selectedDish, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Availability</label>
          <select
            value={selectedDish.is_available ? 'Yes' : 'No'}
            onChange={(e) => setSelectedDish({ ...selectedDish, is_available: e.target.value === 'Yes' })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={handleSaveDish} className="bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition duration-200">
            Save
          </button>
          <button onClick={handleDeleteDish} className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition duration-200">
            Delete
          </button>
          <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-300 text-black px-6 py-3 rounded-lg shadow hover:bg-gray-400 transition duration-200">
            Cancel
          </button>
        </div>
      </div>
    )}
  </Modal>
</div>
  );
};

export default DishTable;
