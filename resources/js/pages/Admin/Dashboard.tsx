import React from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/header/Header';
import { toast } from 'sonner';

type Product = {
  id: number;
  name: string;
  created_at: string;
  user: {
    email: string;
  };
};

type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
};

type PageProps = {
  pendingProducts: Product[];
  auth: {
    user: User;
  };
};

export default function AdminDashboard() {
  const { pendingProducts } = usePage<PageProps>().props;

  const handleApprove = (id: number) => {
    router.post(
      route('admin.products.approve', id),
      {},
      {
        onSuccess: () => toast.success("Product approved successfully."),
        onError: () => toast.error("Failed to approve product."),
      }
    );
  };
  

  const handleReject = (id: number) => {
    const confirmed = window.confirm("Are you sure you want to reject this product?");
    if (confirmed) {
      router.post(
        route('admin.products.reject', id),
        {},
        {
          onSuccess: () => toast.success("Product rejected successfully."),
          onError: () => toast.error("Failed to reject product."),
        }
      );
    }
  };
  

  return (
    <>
      <Header />

      <Card className="max-w-6xl mx-auto mt-10 p-6">
        <h1 className="text-2xl font-bold mb-6">Pending Product Approvals</h1>

        <div className="overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left font-semibold">
              <tr>
                <th className="px-4 py-2">Action ID</th>
                <th className="px-4 py-2">Product ID</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Seller's Email</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-6 text-muted-foreground">
                    No pending products found.
                  </td>
                </tr>
              ) : (
                pendingProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{product.id}</td>
                    <td className="px-4 py-2 text-blue-600 hover:underline cursor-pointer">
                      <a href={route('admin.products.preview', product.id)}>{product.id}</a>
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.user.email}</td>
                    <td className="px-4 py-2 space-x-2">
                    <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(product.id)}
                    >
                    Approve
                    </Button>

                    <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReject(product.id)}
                    >
                    Reject
                    </Button>

                    </td>
                    <td className="px-4 py-2">{product.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
