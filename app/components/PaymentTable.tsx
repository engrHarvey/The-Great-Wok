'use client';

import React, { useEffect, useState } from 'react';

interface Payment {
  payment_id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  amount: number;
}

const PaymentTable: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Fetch payments from the backend (replace with actual API call)
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch((err) => console.error('Failed to fetch payments', err));
  }, []);

  return (
    <table className="min-w-full bg-white shadow-md rounded-lg">
      <thead>
        <tr>
          <th className="py-2 px-4 text-left font-bold text-primary">Payment ID</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Order ID</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Method</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Status</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Amount</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.payment_id} className="border-t">
            <td className="py-2 px-4">{payment.payment_id}</td>
            <td className="py-2 px-4">{payment.order_id}</td>
            <td className="py-2 px-4">{payment.payment_method}</td>
            <td className="py-2 px-4">{payment.payment_status}</td>
            <td className="py-2 px-4">${payment.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaymentTable;
