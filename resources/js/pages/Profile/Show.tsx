import React from 'react';
import { usePage } from '@inertiajs/react';
import Header from '@/components/header/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { PageProps } from '@/types';
import { Link } from '@inertiajs/react';

function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }
  
type Product = {
  id: number;
  title: string;
  price: number;
  slug?: string;
    image?: string;
};

type Review = {
  id: number;
  rating: number;
  feedback: string;
  reviewer: {
    name: string;
  };
};

type UserProfile = {
  id: number;
  name: string;
  matricnum: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  products: Product[];
  reviews: Review[];
    average_rating?: number;
    total_reviews?: number;
};

export default function Show() {
  const { user, auth } = (usePage().props as unknown as PageProps<{ user: UserProfile }>);
  const isOwner = auth.user?.id === user.id;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted py-10">
        {/* Profile Info */}
        <Card className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row items-center md:items-start gap-5 mb-6">
        {user.avatar ? (
            <img
                src={user.avatar}
                alt="Avatar"
                className="w-28 h-28 object-cover rounded-full border-4 border-pink-500"
            />
            ) : (
            <div className="w-28 h-28 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold text-2xl border-4 border-pink-500">
                {getInitials(user.name)}
            </div>
            )}

          <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {user.name}
            <span className="flex items-center gap-1">
                <span className="text-yellow-500 text-lg">★ {(user.average_rating ?? 0).toFixed(1)}</span>
                {(user.total_reviews ?? 0) > 0 && (
                <span className="text-muted-foreground text-sm">
                    ({user.total_reviews} review{user.total_reviews! > 1 ? 's' : ''})
                </span>
                )}
            </span>
            </h1>
            <ul className="text-muted-foreground text-base">
              <li><strong>Bio:</strong> {user.bio || 'No bio added'}</li>
            </ul>

            <div className="flex flex-wrap">
              {isOwner ? (
                <>
                  {/* <Button variant="outline" onClick={() => window.location.href = route('profile.edit')}>
                    Edit Profile
                  </Button> */}
                </>
              ) : (
                <Button onClick={() => window.location.href = route('chat.seller', { selleruser_id: user.id })}>
                  Message Seller
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* My Listings */}
        <div className="max-w-5xl mx-auto mb-12 px-4">
          <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
          <Separator />
          {user.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {user.products.map(product => (
            <Link
                key={product.id}
                href={route('products.show', product.id)}
                className="block"
            >
                <Card className="p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between">
                    {/* Left: Text */}
                    <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-gray-700">
                        Price: <span className="text-[#E95670] font-semibold">RM {Number(product.price).toFixed(2)}</span>
                    </p>
                    </div>

                    {/* Right: Image */}
                    {product.image && (
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-24 h-24 object-cover rounded-lg border ml-4"
                    />
                    )}
                </div>
                </Card>
            </Link>
            ))}

            </div>
          ) : (
            <p className="text-muted-foreground italic mt-4">You have no listings yet.</p>
          )}
        </div>

        {/* Seller Reviews */}
<div className="max-w-5xl mx-auto px-4">
  <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
  <Separator />
  {user.reviews.length > 0 ? (
    <div className="space-y-6 mt-6">
      {user.reviews.map((review) => (
        <Card key={review.id} className="p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              Reviewed by <span className="font-semibold text-gray-900">{review.reviewer.name}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill={i < review.rating ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.176 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118l-3.39-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z"
                  />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-gray-800 italic">"{review.feedback}"</p>
          </Card>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground italic mt-4">No reviews from buyers yet.</p>
  )}
</div>


      </div>
    </>
  );
}
