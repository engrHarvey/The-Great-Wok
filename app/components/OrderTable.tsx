import React, { useEffect, useState } from 'react';

interface Order {
  order_id: number;
  user_id: number;
  total_price: number;
  delivery_type: string;
  created_at: string;
}

const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch order data from the backend (replace with actual API call)
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error('Failed to fetch orders', err));
  }, []);

  return (
    <table className="min-w-full bg-white shadow-md rounded-lg">
      <thead>
        <tr>
          <th className="py-2 px-4 text-left font-bold text-primary">Order ID</th>
          <th className="py-2 px-4 text-left font-bold text-primary">User ID</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Total Price</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Delivery Type</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Date</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.order_id} className="border-t">
            <td className="py-2 px-4">{order.order_id}</td>
            <td className="py-2 px-4">{order.user_id}</td>
            <td className="py-2 px-4">${order.total_price.toFixed(2)}</td>
            <td className="py-2 px-4">{order.delivery_type}</td>
            <td className="py-2 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
