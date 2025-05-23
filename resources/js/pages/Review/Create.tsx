
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Header from '@/components/header/Header';

export default function CreateReview({ productId }: { productId: number }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating from 1 to 5 stars.');
      return;
    }

    router.post(`/review/store/${productId}`, {
      rating,
      feedback,
    }, {
      onSuccess: () => toast.success('Thank you for your feedback!'),
      onError: () => toast.error('Failed to submit review.'),
    });
  };

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto py-10 px-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Leave a Review</h2>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
              >
                ★
              </button>
            ))}
          </div>

          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback here..."
          />

          <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 text-white">
            Submit Review
          </Button>
        </Card>
      </div>
    </>
  );
}
