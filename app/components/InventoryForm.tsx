import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Dish {
  dish_id: number;
  dish_name: string;
}

interface Inventory {
  inventory_id: number;
  dish_id: number;
  dish_name: string;
  quantity_in_stock: number;
  last_updated: string;
}

interface InventoryFormProps {
  dishes: Dish[];
  existingInventory: Inventory[]; // Ensure that `existingInventory` is a required prop
  onInventoryCreated: (updatedInventory: Inventory) => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ dishes, existingInventory, onInventoryCreated }) => {
  const [selectedDishId, setSelectedDishId] = useState<number | ''>(''); // For storing selected dish ID
  const [quantity, setQuantity] = useState<number | ''>(''); // For storing quantity to be added/updated
  const [message, setMessage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Track if in edit mode
  const [existingItem, setExistingItem] = useState<Inventory | null>(null); // Store the existing inventory item if found

  useEffect(() => {
    if (selectedDishId !== '') {
      // Fetch the inventory for the selected dish to check if it already exists
      const fetchInventoryItem = async () => {
        try {
          const response = await axios.get<Inventory>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/dish/${selectedDishId}`
          );
          if (response.status === 200 && response.data) {
            setExistingItem(response.data); // Store the fetched inventory item
            setIsEditMode(true); // Enable edit mode
            setMessage(`Current stock for ${response.data.dish_name}: ${response.data.quantity_in_stock}`);
          } else {
            setExistingItem(null); // If no inventory item is found, set it to null
            setIsEditMode(false);
            setMessage(null);
          }
        } catch (err) {
          setExistingItem(null);
          setIsEditMode(false);
          setMessage('Failed to fetch inventory for the selected dish.');
          console.error('Error fetching inventory item:', err);
        }
      };

      fetchInventoryItem();
    } else {
      setExistingItem(null); // Reset if no dish is selected
      setIsEditMode(false);
      setMessage(null);
    }
  }, [selectedDishId]);

  const handleCreateOrUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDishId === '' || quantity === '') {
      setMessage('Please select a dish and enter a quantity.');
      return;
    }

    try {
      if (existingItem) {
        // If an existing item is found, update its quantity
        const updatedQuantity = existingItem.quantity_in_stock + Number(quantity); // Calculate new quantity

        // Make the PUT request to update the existing inventory
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/${existingItem.inventory_id}`,
          { quantity_in_stock: updatedQuantity }
        );

        if (response.status === 200) {
          // Successfully updated, reflect in the parent state
          onInventoryCreated({
            ...existingItem,
            quantity_in_stock: updatedQuantity,
            last_updated: new Date().toISOString(),
          });
          setMessage('Inventory updated successfully!');
        } else {
          setMessage(`Failed to update inventory: ${response.statusText}`);
        }
      } else {
        // Create a new inventory item if no match is found
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`, {
          dish_id: selectedDishId,
          quantity_in_stock: Number(quantity),
        });

        if (response.status === 201) {
          // Successfully created, add the new item to the parent state
          const newItem = { ...response.data, dish_name: dishes.find((dish) => dish.dish_id === selectedDishId)?.dish_name || '' };
          onInventoryCreated(newItem);
          setMessage('Inventory item created successfully!');
        } else {
          setMessage(`Error: ${response.statusText}`);
        }
      }

      // Clear the form fields and reset edit mode
      setSelectedDishId('');
      setQuantity('');
      setIsEditMode(false); // Reset to default mode after submission
    } catch (err) {
      setMessage('Failed to create or update inventory item. Please try again.');
      console.error('Error during inventory update or creation:', err);
    }
  };
  
  return (
    <form onSubmit={handleCreateOrUpdateInventory} className="mb-8 p-6 bg-neutral-50 shadow-xl rounded-xl">
      <h3 className="text-3xl font-extrabold text-primary mb-6">Add or Update Inventory Item</h3>

      {/* Dish Name Field */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">Dish Name</label>
        <select
          value={selectedDishId}
          onChange={(e) => setSelectedDishId(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white shadow-sm"
        >
          <option value="">Select a dish</option>
          {dishes.map((dish) => (
            <option key={dish.dish_id} value={dish.dish_id}>
              {dish.dish_name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Field */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">Quantity in Stock</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.valueAsNumber || '')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary bg-white shadow-sm"
          placeholder="Enter quantity in stock"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-full hover:bg-secondary transition-all duration-200 ease-in-out shadow-md"
      >
        {isEditMode ? 'Update Inventory' : 'Create Inventory'}
      </button>

      {/* Feedback Message */}
      {message && (
        <div className="mt-6 text-center text-green-600 bg-green-50 border border-green-300 rounded-lg px-4 py-3">
          {message}
        </div>
      )}
    </form>
  );
};

export default InventoryForm;
