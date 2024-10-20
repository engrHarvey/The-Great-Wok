'use client';

import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal'; // Import your modal component
import { useRouter } from 'next/navigation'; // Import router to handle navigation

interface Order {
  order_id: number;
  total_price: number | null;
  placed_at: string;
}

interface OrderItem {
  order_item_id: number;
  dish_id: number;
  dish_name: string;
  quantity: number;
  price: number | null;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null); // Track expanded order
  const [orderItems, setOrderItems] = useState<{ [key: number]: OrderItem[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Track modal visibility
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null); // Track selected order item for review
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError('User is not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          setError('Failed to fetch order history.');
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/items`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems((prev) => ({
          ...prev,
          [orderId]: data,
        }));
      } else {
        setError('Failed to fetch order items.');
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
      setError('Failed to load order items.');
    }
  };

  const toggleExpand = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Collapse if already expanded
    } else {
      setExpandedOrderId(orderId); // Expand new order
      if (!orderItems[orderId]) {
        fetchOrderItems(orderId); // Fetch items if not already fetched
      }
    }
  };

  const handleReview = (item: OrderItem) => {
    setSelectedOrderItem(item); // Set the order item for which review is being written
    setIsModalOpen(true); // Open the modal
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderItem) return;
  
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('User is not authenticated.');
      return;
    }
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          dish_id: selectedOrderItem.dish_id, // Use the dish_id from the updated OrderItem type
          rating,
          comment,
        }),
      });
  
      if (res.ok) {
        alert('Review submitted successfully!');
        setIsModalOpen(false); // Close the modal after submission
        setRating(0); // Reset rating
        setComment(''); // Reset comment
      } else {
        setError('Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review.');
    }
  };    

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-primary">Order History</h2>

      <table className="min-w-full bg-white shadow-xl rounded-lg overflow-hidden text-sm sm:text-base">
        <thead className="bg-primary text-white">
          <tr>
            <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold tracking-wide">Order ID</th>
            <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold tracking-wide">Total Price</th>
            <th className="py-3 sm:py-4 px-4 sm:px-6 text-left font-semibold tracking-wide">Placed At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 sm:py-8 text-center text-gray-500 text-base sm:text-lg font-medium">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <React.Fragment key={order.order_id}>
                <tr
                  className="border-t border-gray-200 hover:bg-gray-100 transition duration-200 cursor-pointer"
                  onClick={() => toggleExpand(order.order_id)}
                >
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800">{order.order_id}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800 font-semibold">₱{Number(order.total_price || 0).toFixed(2)}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800">{new Date(order.placed_at).toLocaleDateString()}</td>
                </tr>

                {expandedOrderId === order.order_id && orderItems[order.order_id] && (
                  <tr>
                    <td colSpan={3}>
                      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner mt-4">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Order Items</h3>
                        <ul className="space-y-4">
                          {orderItems[order.order_id].map((item) => (
                            <li
                              key={item.order_item_id}
                              className="p-3 sm:p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex justify-between items-center"
                            >
                              <div>
                                <p className="text-base sm:text-lg font-medium text-gray-900">{item.dish_name}</p>
                                <p className="text-sm sm:text-base text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm sm:text-base text-gray-600">Price: ₱{Number(item.price || 0).toFixed(2)}</p>
                              </div>
                              <button
                                onClick={() => handleReview(item)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200 text-xs sm:text-sm"
                              >
                                Review
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {/* Review Modal */}
      {selectedOrderItem && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Review">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Review for {selectedOrderItem.dish_name}</h3>
            <label className="block">
              <span className="block text-sm sm:text-base font-semibold text-gray-700">Rating:</span>
              <select
                className="mt-2 block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value={0}>Select Rating</option>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm sm:text-base font-semibold text-gray-700">Comment:</span>
              <textarea
                className="mt-2 block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={handleSubmitReview}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200 text-sm sm:text-base"
              >
                Submit
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderHistoryPage;
