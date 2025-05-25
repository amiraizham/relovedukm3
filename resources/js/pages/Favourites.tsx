import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { Product } from '@/types/Products';
import ProductList from '@/components/products/ProductList';
import Header from '@/components/header/Header';
import type { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

type FavouritesPageProps = PageProps<{
  favorites: {
    data: Product[];
    next_page_url: string | null;
  };
}>;

export default function Favourites() {
  const { favorites: initialFavorites } = usePage<FavouritesPageProps>().props;

  const [loadedFavorites, setLoadedFavorites] = useState<Product[]>(initialFavorites?.data || []);
  const [nextPageUrl, setNextPageUrl] = useState(initialFavorites?.next_page_url || null);
  const loadMore = () => {
    if (!nextPageUrl) return;

    router.get(nextPageUrl, {}, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ['favorites'],
      onSuccess: (page) => {
        const favs = page.props.favorites as { data: Product[]; next_page_url: string | null };
        setLoadedFavorites(prev => [...prev, ...favs.data]);
        setNextPageUrl(favs.next_page_url);
        window.history.replaceState({}, '', route('favorites.index'));
      },
    });
  };
  return (
    <>
      <Header />

      <div className="p-7 min-h-[400px]">
  <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
    <div>
      <h2 className="text-2xl font-bold mb-1">Your Favourites</h2>
      <p className="text-muted-foreground text-sm">
        Here's a list of products you've marked as favorite.
      </p>
    </div>
  </div>
  {loadedFavorites.length > 0 ? (
          <>
            <ProductList products={{ data: loadedFavorites }} />

            {nextPageUrl ? (
            <div className="text-center mb-6">
              <Button onClick={loadMore} className="bg-pink-600 text-white hover:bg-pink-700">
                Load More
              </Button>
            </div>
          ) : (
            <div className="text-center mb-10">
              {!nextPageUrl && (
                <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-pink-600 text-white hover:bg-pink-700 rounded-full px-4 py-2 shadow-lg"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              )}
            </div>
          )}
          </>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground text-base italic min-h-[300px]">
            You have no favourite items yet.
          </div>
        )}
</div>

    </>
  );
}
