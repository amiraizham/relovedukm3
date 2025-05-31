import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import Header from '@/components/header/Header';
import ProductList from '@/components/products/ProductList';
import { route } from 'ziggy-js';
import type { Product } from '@/types/Products';
import type { PageProps } from '@/types';
import { Button } from "@/components/ui/button";
import { ChevronUp, Filter, Plus } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { useMediaQuery } from 'usehooks-ts'; // Or custom hook for media query

type DashboardProps = PageProps<{
  products: {
    next_page_url: any;
    links: any;
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
  const [loadedProducts, setLoadedProducts] = useState<Product[]>(products.data);
  const [nextPageUrl, setNextPageUrl] = useState(products.next_page_url);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const loadMore = () => {
    if (!nextPageUrl) return;

    router.get(nextPageUrl, {}, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ['products'],
      onSuccess: (page) => {
        const newProducts = page.props.products as { data: Product[]; next_page_url: any };
        setLoadedProducts(prev => [...prev, ...newProducts.data]);
        setNextPageUrl(newProducts.next_page_url);
        window.history.replaceState({}, '', route('dashboard'));
      },
    });
  };

  const handleFilterChange = (
    category = selectedCategory,
    sort = selectedSort
  ) => {
    const query: Record<string, string> = {};

    if (category !== 'all') query.category = category;
    if (sort && sort !== 'latest') query.sort = sort;
    if (search) query.search = search;

    router.get(route('dashboard'), query, {
      preserveScroll: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('latest');
    router.get(route('dashboard'), {}, {
      preserveScroll: true,
      replace: true,
    });
  };

  return (
    <>
      <Header />

      {user ? (
        <>
          <div className="flex justify-between items-center pt-7 px-7 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold">
                {isSearching
                  ? hasResults
                    ? 'Searched Products'
                    : 'No Products Found'
                  : 'Explore Products'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? hasResults
                    ? 'Showing matching results...'
                    : 'Try a different keyword.'
                  : "Start buying now! Don't miss the deals."}
              </p>
            </div>

            {!isMobile ? (
              <div className="flex items-center gap-4">
                {/* Desktop Filters */}
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    handleFilterChange(value, selectedSort);
                  }}
                >
                  <SelectTrigger className="w-[200px] rounded-full shadow-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg rounded-md">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Clothes">Clothes</SelectItem>
                    <SelectItem value="Shoes">Shoes</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSort}
                  onValueChange={(value) => {
                    setSelectedSort(value);
                    handleFilterChange(selectedCategory, value);
                  }}
                >
                  <SelectTrigger className="w-[200px] rounded-full shadow-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg rounded-md">
                    <SelectItem value="latest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="rounded-full shadow-sm" variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>

                <Link
                  href={route('products.sellform')}
                  className="bg-pink-600 text-white px-7 py-2 rounded-full hover:bg-pink-700 transition"
                >
                  Sell
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile Filter Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='bg-white'>
                    <DialogTitle>Filter Options</DialogTitle>
                    <div className="space-y-4">
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => {
                          setSelectedCategory(value);
                          handleFilterChange(value, selectedSort);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Clothes">Clothes</SelectItem>
                          <SelectItem value="Shoes">Shoes</SelectItem>
                          <SelectItem value="Books">Books</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Vehicle">Vehicle</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedSort}
                        onValueChange={(value) => {
                          setSelectedSort(value);
                          handleFilterChange(selectedCategory, value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value="latest">Newest</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                          <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                          <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button onClick={resetFilters} className="w-full" variant="outline">
                        Reset Filters
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Floating Sell Button */}
                <Link
                  href={route('products.sellform')}
                  className="fixed bottom-6 right-6 z-50 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>

          <ProductList products={{ data: loadedProducts }} search={search} />

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
        <div className="text-center mt-10 text-gray-500">
          Please log in with your UKM email to view the products.
        </div>
      )}
    </>
  );
}
