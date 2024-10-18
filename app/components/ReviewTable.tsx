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

  useEffect(() => {
    // Fetch reviews from the backend (replace with actual API call)
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Failed to fetch reviews', err));
  }, []);

  return (
    <table className="min-w-full bg-white shadow-md rounded-lg">
      <thead>
        <tr>
          <th className="py-2 px-4 text-left font-bold text-primary">Dish Name</th>
          <th className="py-2 px-4 text-left font-bold text-primary">User</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Rating</th>
          <th className="py-2 px-4 text-left font-bold text-primary">Comment</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((review) => (
          <tr key={review.review_id} className="border-t">
            <td className="py-2 px-4">{review.dish_name}</td>
            <td className="py-2 px-4">{review.username}</td>
            <td className="py-2 px-4">{review.rating}</td>
            <td className="py-2 px-4">{review.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReviewTable;
