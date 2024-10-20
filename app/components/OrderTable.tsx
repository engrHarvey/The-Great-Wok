import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';  // Import the Modal component

interface Order {
  order_id: number;
  user_id: number;
  username: string;
  email: string;
  total_price: number | null;  // Allow total_price to be null to avoid runtime issues
  delivery_type: string;
  status: string;
  placed_at: string;
}

const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);  // Track the selected order

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      if (res.status === 200) {
        setOrders(res.data);
      } else {
        setError(`Error fetching orders: ${res.statusText}`);
      }
    } catch (err) {
      setError('Failed to load orders.');
      console.error('Failed to fetch orders', err);
    }
  };

  // Handle clicking a table row to open the modal
  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);  // Open the modal
  };

  // Handle confirming the order is "Done Preparing"
  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    const token = localStorage.getItem('jwtToken'); // Get the token from localStorage

    if (!token) {
      setError('User is not authenticated.');
      return;
    }

    try {
      // Send a request to update the order status to "Done Preparing"
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${selectedOrder.order_id}/status`,
        { status: 'Done Preparing' },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (res.status === 200) {
        alert('Order status updated to "Done Preparing"');
        fetchOrders(); // Refresh orders after status update
        setIsModalOpen(false); // Close the modal
      } else {
        setError('Failed to update order status.');
      }
    } catch (err) {
      console.error('Error updating order status', err);
      setError('Failed to update order status.');
    }
  };

  // Sort orders by 'order_id' (ascending) and place "Done Preparing" orders at the end
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'Done Preparing' && b.status !== 'Done Preparing') return 1;
    if (a.status !== 'Done Preparing' && b.status === 'Done Preparing') return -1;
    return a.order_id - b.order_id;  // Ascending order by order_id
  });

  return (
    <div className="p-8 bg-white shadow-xl rounded-xl">
  <h2 className="text-4xl font-extrabold mb-8 text-primary">Orders</h2>

  {/* Display Error Message */}
  {error && (
    <p className="text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-3 mb-6 text-center font-semibold">
      {error}
    </p>
  )}

  {/* Orders Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full bg-neutral-50 shadow-lg rounded-lg overflow-hidden">
      <thead className="bg-primary text-white">
        <tr>
          <th className="py-4 px-6 text-left font-semibold text-lg">Order ID</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Username</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Email</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Total Price</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Delivery Type</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Status</th>
          <th className="py-4 px-6 text-left font-semibold text-lg">Placed At</th>
        </tr>
      </thead>
      <tbody>
        {sortedOrders.length === 0 ? (
          <tr>
            <td colSpan={7} className="py-8 text-center text-gray-500 text-lg font-medium">
              No orders found.
            </td>
          </tr>
        ) : (
          sortedOrders.map((order) => (
            <tr
              key={order.order_id}
              className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out cursor-pointer"
              onClick={() => handleRowClick(order)}  // Open modal on row click
            >
              <td className="py-4 px-6 text-gray-700">{order.order_id}</td>
              <td className="py-4 px-6 text-gray-700">{order.username}</td>
              <td className="py-4 px-6 text-gray-700">{order.email}</td>
              <td className="py-4 px-6 text-dark font-medium text-right">₱{Number(order.total_price || 0).toFixed(2)}</td>
              <td className="py-4 px-6 text-gray-700">{order.delivery_type}</td>
              <td className="py-4 px-6">
                {/* Apply color codes based on the status */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-600'
                      : order.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-600'
                      : order.status === 'Done Preparing'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-4 px-6 text-gray-700">{new Date(order.placed_at).toLocaleDateString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Modal for Confirming Order */}
  {selectedOrder && (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Confirm Order Completion"
    >
      <p className="mb-4">Is the order with ID {selectedOrder.order_id} completed?</p>
      <div className="flex justify-end">
        <button
          onClick={handleConfirmOrder}
          className="bg-primary text-white px-6 py-2 rounded-full mr-4 hover:bg-secondary transition duration-300"
        >
          Yes, Mark as Done
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

export default OrderTable;
