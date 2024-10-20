import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal'; // Your provided Modal component

interface OrderItem {
  order_item_id: number;
  order_id: number;
  dish_name: string;
  quantity: number;
  price: number | null;  // Allow price to be null to avoid runtime issues
  status: string;  // Add the 'status' field
}

const OrderItemsTable: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderItems();
  }, []);

  const fetchOrderItems = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order-items`);
      if (res.status === 200) {
        setOrderItems(res.data);
      } else {
        setError('Failed to fetch order items');
      }
    } catch (err) {
      console.error('Failed to fetch order items', err);
      setError('Error fetching order items');
    }
  };

  // Sort items by 'order_id', and move items with status "Done Preparing" to the end
  const sortedOrderItems = [...orderItems].sort((a, b) => {
    if (a.status === 'Done Preparing' && b.status !== 'Done Preparing') return 1;
    if (a.status !== 'Done Preparing' && b.status === 'Done Preparing') return -1;
    return a.order_id - b.order_id;
  });

  // Handle row click and open modal
  const handleRowClick = (orderItem: OrderItem) => {
    setSelectedOrderItem(orderItem);
    setIsModalOpen(true);  // Open the modal
  };

  // Handle the confirmation to mark as "Done Preparing"
  const handleConfirmStatusUpdate = async () => {
    if (!selectedOrderItem) return;

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order-items/${selectedOrderItem.order_item_id}/status`
      );

      if (res.status === 200) {
        alert('Order item marked as "Done Preparing"');
        fetchOrderItems(); // Refresh the order items
        setIsModalOpen(false); // Close the modal
      } else {
        setError('Failed to update order item status');
      }
    } catch (err) {
      console.error('Error updating order item status', err);
      setError('Failed to update order item status');
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-8">
      <h2 className="text-3xl font-extrabold mb-6 text-primary">All Order Items</h2>
      {error && (
        <p className="text-red-500 bg-red-100 border border-red-400 rounded-lg px-4 py-3 mb-6 text-center font-semibold">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-primary text-white">
              <th className="py-4 px-6 text-center font-semibold text-lg">Order ID</th>
              <th className="py-4 px-6 text-center font-semibold text-lg">Dish Name</th>
              <th className="py-4 px-6 text-center font-semibold text-lg">Quantity</th>
              <th className="py-4 px-6 text-right font-semibold text-lg">Price</th>
              <th className="py-4 px-6 text-center font-semibold text-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrderItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-lg font-medium">
                  No order items found.
                </td>
              </tr>
            ) : (
              sortedOrderItems.map((item) => (
                <tr
                  key={item.order_item_id}
                  className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="py-4 px-6 text-center text-gray-700">{item.order_id}</td>
                  <td className="py-4 px-6 text-center text-gray-700">{item.dish_name}</td>
                  <td className="py-4 px-6 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-4 px-6 text-right text-gray-800 font-semibold">
                    ₱{Number(item.price || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : item.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-600'
                          : item.status === 'Done Preparing'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderItem && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirm Status Update"
        >
          <p>Mark the item &quot;{selectedOrderItem.dish_name}&quot; as &quot;Done Preparing&quot;?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleConfirmStatusUpdate}
              className="bg-primary text-white px-6 py-2 rounded-full mr-4 hover:bg-secondary transition duration-300"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderItemsTable;
