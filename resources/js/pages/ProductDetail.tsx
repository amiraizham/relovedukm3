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

export default function ProductDetail() {
  const { product, auth, alreadyBooked } = usePage<PageProps<{ product: Product }>>().props;
  const isOwner = product.user_id === auth.user.id;
  const handleBookItem = (productId: number) => {
    const formData = new FormData();
    formData.append('product_id', productId.toString());
  
    router.post(route('bookings.store', productId), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Booking request sent successfully!');
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
              <div className="flex items-center gap-3">
              <img
                src={product.user.avatar || '/avatar-placeholder.png'}
                alt="Avatar"
                className="w-10 h-10 rounded-full border object-cover"
              />
              <span className="font-semibold text-gray-800">{product.user.name}</span>

              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={route('products.edit', product.id)}>Edit</Link>
                    </DropdownMenuItem>
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
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Category */}
            <Badge className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm w-fit">
            {product.category}
          </Badge>

            {/* Price */}
            <p className="text-2xl font-bold text-pink-600">RM {product.price}</p>

            {/* Description */}
            <p className="text-gray-700">{product.description}</p>

            {/* Action Buttons */}
            {product.user_id !== auth.user.id && (
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() =>
                  router.visit(route('chat.seller', { selleruser_id: product.user_id }))
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Chat
              </Button>

              {alreadyBooked ? (
                <Button
                  disabled
                  className="bg-gray-400 text-white cursor-not-allowed"
                >
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
