'use client';

import React, { useEffect, useState } from 'react';

interface Review {
  review_id: number;
  dish_name: string;
  username: string;
  rating: number;
  comment: string;
}

const ReviewTable: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch reviews from the backend
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="overflow-x-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <table className="min-w-full bg-white rounded-lg shadow-md divide-y divide-gray-200">
        <thead className="bg-primary text-white">
          <tr>
            <th className="py-4 px-6 text-left font-semibold text-lg">Dish Name</th>
            <th className="py-4 px-6 text-left font-semibold text-lg">User</th>
            <th className="py-4 px-6 text-left font-semibold text-lg">Rating</th>
            <th className="py-4 px-6 text-left font-semibold text-lg">Comment</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 px-6 text-center text-gray-500 text-lg font-medium">
                No reviews available
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr
                key={review.review_id}
                className="hover:bg-gray-100 transition-colors duration-200 ease-in-out"
              >
                <td className="py-4 px-6 text-gray-800 font-medium">{review.dish_name}</td>
                <td className="py-4 px-6 text-gray-800">{review.username}</td>
                <td className={`py-4 px-6 font-bold ${
                  review.rating >= 4
                    ? 'text-green-600 bg-green-50 px-3 py-1 rounded-lg' // High rating
                    : review.rating === 3
                    ? 'text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg' // Medium rating
                    : 'text-red-600 bg-red-50 px-3 py-1 rounded-lg'    // Low rating
                }`}>
                  {review.rating} / 5
                </td>
                <td className="py-4 px-6 text-gray-700">{review.comment}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewTable;
