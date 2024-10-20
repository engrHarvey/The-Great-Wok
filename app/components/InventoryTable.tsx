import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InventoryForm from './InventoryForm';
import Modal from './Modal';

interface Inventory {
  inventory_id: number;
  dish_id: number;
  dish_name: string;
  quantity_in_stock: number;
  last_updated: string;
}

interface Dish {
  dish_id: number;
  dish_name: string;
}

const InventoryTable: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Track modal visibility
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null); // Track the selected item for deletion

  useEffect(() => {
    fetchInventoryAndDishes();
  }, []);

  const fetchInventoryAndDishes = async () => {
    try {
      const [inventoryRes, dishesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dishes`),
      ]);

      if (inventoryRes.status === 200) {
        setInventory(inventoryRes.data);
      } else {
        setError(`Error fetching inventory: ${inventoryRes.statusText}`);
      }

      if (dishesRes.status === 200) {
        setDishes(dishesRes.data);
      } else {
        setError(`Error fetching dishes: ${dishesRes.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching inventory or dishes:', err); // Log the error
      setError('Failed to load inventory or dishes data.');
    }
  };

  const handleInventoryCreated = (updatedInventory: Inventory) => {
    setInventory((prev) => {
      const existingIndex = prev.findIndex((item) => item.inventory_id === updatedInventory.inventory_id);
      if (existingIndex !== -1) {
        return prev.map((item, idx) => (idx === existingIndex ? updatedInventory : item));
      }
      return [...prev, updatedInventory];
    });
    setShowForm(false);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/${selectedItem.inventory_id}`);

      if (response.status === 200) {
        setInventory((prev) => prev.filter((item) => item.inventory_id !== selectedItem.inventory_id)); // Remove item from state
        setIsDeleteModalOpen(false); // Close modal after deletion
        setSelectedItem(null);
      } else {
        setError('Failed to delete the inventory item.');
      }
    } catch (err) {
      console.error('Error deleting inventory item:', err); // Log the error
      setError('Failed to delete the inventory item.');
    }
  };

  return (
    <div className="p-8 bg-white shadow-xl rounded-xl">
      <h2 className="text-4xl font-extrabold mb-8 text-primary">Inventory Management</h2>

      {/* Toggle Form Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-8 bg-primary text-white py-3 px-6 rounded-full hover:bg-accent transition-all duration-200 ease-in-out shadow-md"
      >
        {showForm ? 'Cancel' : 'Add Inventory'}
      </button>

      {/* Inventory Form */}
      {showForm && (
        <div className="mb-8 p-6">
          <InventoryForm
            dishes={dishes}
            existingInventory={inventory}
            onInventoryCreated={handleInventoryCreated}
          />
        </div>
      )}

      {/* Display Error Message */}
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-6 text-center font-semibold">
          {error}
        </p>
      )}

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-primary text-white">
            <tr>
              <th className="py-4 px-6 text-left font-semibold text-lg">Dish Name</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Quantity in Stock</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500 text-lg font-medium">
                  No inventory data found.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr
                  key={item.inventory_id}
                  className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item); // Set selected item
                    setIsDeleteModalOpen(true); // Open the delete modal
                  }}
                >
                  <td className="py-4 px-6 text-gray-700">{item.dish_name}</td>
                  <td className="py-4 px-6 text-dark font-medium">{item.quantity_in_stock}</td>
                  <td className="py-4 px-6 text-gray-700">{new Date(item.last_updated).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Inventory Item">
        {selectedItem && (
          <div>
            <p className="mb-4">Are you sure you want to delete the inventory item for &quot;{selectedItem.dish_name}&quot;?</p>
            <div className="flex justify-end">
              <button
                onClick={handleDeleteItem}
                className="bg-red-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-red-700 transition duration-200 ease-in-out"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryTable;
