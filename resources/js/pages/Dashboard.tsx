import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import Header from '@/components/header/Header';
import ProductList from '@/components/products/ProductList';
import { route } from 'ziggy-js';

export default function Dashboard() {
  const { props } = usePage();
  const user = props.auth?.user;
  const products = props.products || [];

  return (
    <>
      <Header />

      {user ? (
        <>
          <div className="flex justify-between items-center p-6">
        
            <h2 className="text-2xl font-bold">Available Products</h2>
            <Link
              href={route('products.sellform')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Sell
            </Link>
          </div>
          <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Product List</h1>
          <p className="text-sm text-muted-foreground">Track stock levels, availability, and restocking needs in real time.</p>
        </div>
      </div>

          <ProductList  products={products}/>
          </>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          Please log in with your UKM email to view the products.
        </div>
      )}
    </>
  );
}
