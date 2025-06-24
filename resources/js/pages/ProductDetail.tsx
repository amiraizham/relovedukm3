import React from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import Header from '@/components/header/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { PageProps } from '@/types';
import type { Product } from '@/types/Products';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // only if you use utility class merging
import { useEffect, useState } from 'react';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
}

export default function ProductDetail() {
  const { product, auth, alreadyBooked, approvedBooking } = usePage<PageProps<{ product: Product }>>().props;
  const isOwner = product.user_id === auth.user.id;
  const [liked, setLiked] = useState<boolean>(false);

useEffect(() => {
  const saved = JSON.parse(localStorage.getItem('liked_products') || '[]');
  setLiked(saved.includes(product.id));
}, [product.id]);

const toggleFavorite = async () => {
  const saved = JSON.parse(localStorage.getItem('liked_products') || '[]');

  try {
    if (saved.includes(product.id)) {
      await router.delete(route('favorites.destroy', product.id));
      const updated = saved.filter((id: number) => id !== product.id);
      localStorage.setItem('liked_products', JSON.stringify(updated));
      setLiked(false);
    } else {
      await router.post(route('favorites.store', product.id));
      saved.push(product.id);
      localStorage.setItem('liked_products', JSON.stringify(saved));
      setLiked(true);
    }
  } catch (error) {
    toast.error('Failed to update favorite status.');
  }
};

const handleBookItem = (productId: number) => {
  const formData = new FormData();
  formData.append('product_id', productId.toString());

  router.post(route('bookings.store', productId), formData, {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => {
      toast.success('You’ve booked this item. Your booking is valid for 2 hours.', {
        action: {
          label: 'View Booking',
          onClick: () => {
            router.visit(route('notifications.index', { id: auth.user.id }));
          },
        },
      });
    },
    onError: () => {
      toast.error('Failed to book item. Please try again.');
    },
  });
};

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-8">

          {/* Left: Image */}
          <div className="md:w-1/2 w-full">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[360px] object-cover rounded-lg"
            />
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            {/* Owner + Menu */}
            <div className="flex justify-between items-center">
            <Link
                href={route("profile.show", { id: product.user_id })}
                className="flex items-center gap-3 hover:underline text-gray-800"
              >
                {product.user.avatar ? (
                <img
                  src={product.user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold text-sm border">
                  {getInitials(product.user.name)}
                </div>
              )}

                <span className="font-semibold">{product.user.name}</span>
              </Link>

              {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {product.status !== 'sold' ? (
                  <DropdownMenuItem asChild>
                    <Link href={route('products.edit', product.id)}>Edit</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>
                    Edit 
                  </DropdownMenuItem>
                )}

                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        router.delete(route('products.delete', product.id));
                      }
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={toggleFavorite}
                className={`p-1 rounded-full transition-colors ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                aria-label={liked ? 'Unfavorite' : 'Favorite'}
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </button>
            )}

            </div>

            <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            {product.status === 'sold' && (
              <Badge className="bg-red-500 text-white font-medium px-3 py-1 rounded-full text-xs border border-pink-300 shadow-sm">
                Sold
              </Badge>
            )}
          </div>



            {/* Category */}
            <Badge className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm w-fit">
            {product.category}
          </Badge>

            {/* Price */}
            <p className="text-2xl font-bold text-pink-600">RM {product.price}</p>

            {/* Description */}
            <p className="text-gray-700">{product.description}</p>

            {/* Action Buttons */}
            {product.user_id !== auth.user.id && product.status !== 'sold' && (
    <div className="flex gap-4 pt-4">
        <Button
            onClick={() => {
                router.visit(route('chat.seller', { selleruser_id: product.user_id }), {
                    preserveScroll: true,
                });
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            Chat
        </Button>

        {product.approvedBooking ? (
            <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                Booking Approved
            </Button>
        ) : product.alreadyBooked ? (
            <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                Booked
            </Button>
        ) : (
            <Button
                onClick={() => handleBookItem(product.id)}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2"
            >
                Book Item
            </Button>
        )}
    </div>
)}

          </div>
        </div>
      </div>
    </>
  );
}
