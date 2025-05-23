
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Header from '@/components/header/Header';

interface Product {
  id: number;
  product_name: string;
  product_price: string;
  product_description: string;
  image_url: string;
  category: string;
}

interface Review {
buyer_name: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface ViewReviewProps {
  product: Product;
  review: Review;
}

const View: React.FC<ViewReviewProps> = ({ product, review }) => {
  return (
    <>
    <Header />
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Product Details */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full md:w-1/3 h-64 object-cover rounded-lg"
          />
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold">{product.product_name}</h2>
            <Badge className="bg-pink-100 text-pink-800">
              {product.category}
            </Badge>
            <p className="text-xl text-pink-600 font-semibold">
              RM {parseFloat(product.product_price).toFixed(2)}
            </p>
            <p className="text-gray-700">{product.product_description}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>

        <p className="text-sm text-gray-600 mb-1">
            By <span className="font-medium">{review.buyer_name}</span>
        </p>

        <div className="flex items-center mb-2">
            {[...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-5 h-5 ${
                index < review.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
                fill={index < review.rating ? 'currentColor' : 'none'}
            />
            ))}
        </div>

        <p className="text-gray-800 italic">"{review.feedback}"</p>
        <p className="text-sm text-gray-500 mt-2">
            Reviewed on {new Date(review.created_at).toLocaleDateString()}
        </p>
        </Card>

    </div>
    </>
  );
};

export default View;
