import React from 'react';
import { usePage } from '@inertiajs/react';
import type { Product } from '@/types/Products';
import ProductList from '@/components/products/ProductList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header/Header';

import type { PageProps } from '@/types'; // Ensure this import exists and points to your PageProps definition

type FavouritesPageProps = PageProps<{
  favorites: Product[];
}>;

export default function Favourites() {
  const { favorites } = usePage<FavouritesPageProps>().props;

  return (
    <>
      <Header />
    
    <div className="p-6 max-w-7xl mx-auto">

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            Your Favourites
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Here's a list of products you've marked as favorite.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {favorites.length > 0 ? (
<ProductList products={{ data: favorites }} />
          ) : (
            <div className="text-center text-muted-foreground py-10">
              You have no favorite items yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );

}
