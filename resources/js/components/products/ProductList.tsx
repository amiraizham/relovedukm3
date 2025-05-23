import React, { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Product } from '@/types/Products';


dayjs.extend(relativeTime);

type ProductPageProps = {
  products: {
    data: Product[];
  };
  search?: string;
};

export default function ProductList({ products, search }: ProductPageProps) {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('liked_products');
    if (saved) {
      setLikedProducts(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = async (productId: number) => {
    try {
      if (likedProducts.includes(productId)) {
        await router.delete(route('favorites.destroy', productId));
        setLikedProducts(likedProducts.filter(id => id !== productId));
      } else {
        await router.post(route('favorites.store', productId));
        setLikedProducts([...likedProducts, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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
            className="rounded-xl overflow-hidden border border-muted shadow-sm hover:shadow-md transition p-3 flex flex-col justify-between h-[340px]"
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}                  
                    className={`transition-all duration-200 hover:text-red-500 ${
                    likedProducts.includes(product.id) && animatingHeart === product.id
                      ? 'animate-pulse text-red-500'
                      : likedProducts.includes(product.id)
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}
                  aria-label={likedProducts.includes(product.id) ? 'Unlike product' : 'Like product'}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      likedProducts.includes(product.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


function getStockVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'in_stock':
      return 'default';
    case 'low_stock':
      return 'secondary';
    case 'sold':
    case 'sold_out':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatStockStatus(status: string): string {
  return {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    sold_out: 'Sold Out',
    sold: 'Sold Out',
  }[status] || 'Unknown';
}
