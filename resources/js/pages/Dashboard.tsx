import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import Header from '@/components/header/Header';
import ProductList from '@/components/products/ProductList';
import { route } from 'ziggy-js';
import type { Product } from '@/types/Products';
import type { PageProps } from '@/types';
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useEffect } from 'react';


type DashboardProps = PageProps<{
  products: {
    data: Product[];
  };
  search?: string;
  category?: string;
  sort?: string;
}>;

export default function Dashboard() {
  const {
    products,
    search = '',
    category: initialCategory = '',
    sort: initialSort = 'latest',
    auth,
  } = usePage<DashboardProps>().props;
  const user = auth?.user;
  const productsArray: Product[] = products.data;
  const isSearching = Boolean(search);
  const hasResults = productsArray.length > 0;

  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedSort, setSelectedSort] = useState(initialSort || 'latest');

//   useEffect(() => {
//     setSelectedCategory(initialCategory || 'all');
//   }, [initialCategory]);
// useEffect(() => {

//   setSelectedSort(initialSort || 'latest');
// }, [ initialSort]);
  
const handleFilterChange = (
  category = selectedCategory,
  sort = selectedSort
) => {
  const query: Record<string, string> = {};

  if (category !== 'all') {
    query.category = category;
  }

  if (sort && sort !== 'latest') {
    query.sort = sort;
  }

  if (search) {
    query.search = search;
  }

  console.log("Sending query:", query);
  router.get(route('dashboard'), query, {
    preserveScroll: true,
    replace: true,
  });
};

  return (
    <>
      <Header />

      {user ? (
        <>
          <div className="flex justify-between items-center p-3 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {isSearching
                  ? hasResults
                    ? 'Searched Products'
                    : 'No Products Found'
                  : 'Available Products'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? hasResults
                    ? 'Showing matching results...'
                    : 'Try a different keyword.'
                  : "Start buying now! Don't miss the deals."}
              </p>
            </div>

            <div className="flex items-center gap-4">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                console.log("Category selected:", value);
                setSelectedCategory(value); // still update state
                handleFilterChange(value, selectedSort);
              }}
              
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg rounded-md">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Clothes">Clothes</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>  
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Stationary">Stationary</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>



              {/* Sort Filter */}
              <Select
                value={selectedSort}  // ✅ Bound to state
                onValueChange={(value) => {
                  setSelectedSort(value);
                  handleFilterChange(selectedCategory, value);
                }
                }
              >

                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg rounded-md">
                  <SelectItem value="latest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                  <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSort('latest');
                  router.get(route('dashboard'), {}, {
                    preserveScroll: true,
                    replace: true,
                  });
                }}
              >
                Reset Filters
              </Button>

              {/* Sell Button */}
              <Link
                href={route('products.sellform')}
                className="bg-blue-600 text-white px-7 py-2 rounded hover:bg-blue-700 transition"
              >
                Sell
              </Link>
            </div>
          </div>

          <ProductList products={products} search={search} />
        </>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          Please log in with your UKM email to view the products.
        </div>
      )}
    </>
  );
}
