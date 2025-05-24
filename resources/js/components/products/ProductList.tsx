import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Product } from '@/types/Products';
import type { PageProps } from '@/types';

dayjs.extend(relativeTime);

type ProductPageProps = {
  products: {
    data: Product[];
  };
  search?: string;
};

function LikedHeartButton({ productId }: { productId: number }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('liked_products') || '[]');
    setLiked(saved.includes(productId));
  }, [productId]);

  const toggleFavorite = async () => {
    const saved = JSON.parse(localStorage.getItem('liked_products') || '[]');
    let updated = [...saved];

    try {
      if (saved.includes(productId)) {
        await router.delete(route('favorites.destroy', productId));
        updated = saved.filter((id: number) => id !== productId);
        setLiked(false);
      } else {
        await router.post(route('favorites.store', productId));
        updated.push(productId);
        setLiked(true);
      }

      localStorage.setItem('liked_products', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      className={`p-1 rounded-full transition-colors ${
        liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
      aria-label={liked ? 'Unfavorite' : 'Favorite'}
    >
      <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
    </button>
  );
}


export default function ProductList({ products, search }: ProductPageProps) {
  const { auth } = usePage<PageProps>().props;

  //const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);

  // useEffect(() => {
  //   const saved = localStorage.getItem('liked_products');
  //   if (saved) {
  //     setLikedProducts(JSON.parse(saved));
  //   }
  // }, []);

  // const toggleFavorite = async (productId: number) => {
  //   try {
  //     if (likedProducts.includes(productId)) {
  //       await router.delete(route('favorites.destroy', productId));
  //       setLikedProducts(likedProducts.filter(id => id !== productId));
  //       router.reload({ only: ['products'] });
  //             } else {
  //       await router.post(route('favorites.store', productId));
  //       setLikedProducts([...likedProducts, productId]);
  //       router.reload({ only: ['products'] });
  //             }
  //   } catch (error) {
  //     console.error('Error toggling favorite:', error);
  //   }
  // };

  if (!products?.data?.length) {
    return (
      <div className="text-center text-muted-foreground mt-10 text-sm">
        {search ? `No products found matching "${search}".` : "No products available."}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.data.map((product) => (
          <Card
            onClick={() => router.visit(route('products.show', product.id))}
            key={product.id}
            className="rounded-xl overflow-hidden border border-muted shadow-md shadow-gray-300 hover:shadow-md transition p-3 flex flex-col justify-between h-[340px]"
          >
            {/* Image */}
            <div className="relative w-full h-[170px] overflow-hidden rounded-md mb-2">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col gap-1 text-sm px-1">
              {/* Title + Price */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base text-foreground truncate">
                  {product.title}
                </h2>
                <span className="text-base font-bold text-gray-800 ml-2 whitespace-nowrap">
                  RM {product.price}
                </span>
              </div>

              {/* Category Badge */}
              <Badge className="bg-pink-100 text-pink-800 font-medium px-3 py-1 rounded-full text-xs border border-pink-300 shadow-sm">
                {product.category}
              </Badge>

              {/* Date + Favourite */}
              <div className="flex items-center justify-between mt-1">
                <div className="text-[11px] text-muted-foreground">
                  {dayjs(product.created_at).fromNow()}
                </div>

                {/* 🛑 Hide heart if owner */}
                {product.user_id !== auth.user.id && (
                  <LikedHeartButton productId={product.id} />
                )}

              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
