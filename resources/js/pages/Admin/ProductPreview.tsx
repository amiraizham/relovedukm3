import React, { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import type { PageProps } from '@/types';
import Header from '@/components/header/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import ReasonModal from './ReasonModal';


export default function ProductPreview() {
  const { product } = usePage<PageProps<{ product: any }>>().props;

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const handleApprove = (id: number) => {
    router.post(
      route('admin.products.approve', id),
      {},
      {
        onSuccess: () => toast.success("Product approved."),
        onError: () => toast.error("Failed to approve product."),
      }
    );
  };

  const handleRejectClick = () => {
    setShowModal(true);
  };

  const handleSubmitReason = () => {
    if (!selectedReason) {
      toast.error("Please select a reason.");
      return;
    }

    router.post(
      route('admin.products.reject', product.id),
      { reason: selectedReason },
      {
        onSuccess: () => {
          toast.success("Product rejected.");
          setShowModal(false);
          setSelectedReason('');
        },
        onError: () => toast.error("Failed to reject product."),
      }
    );
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-xl shadow relative">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-start">
          <Link
            href={route('admin.dashboard')}
            className="inline-flex items-center text-pink-600 hover:text-pink-800 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Centered Title */}
        <h1 className="text-2xl font-bold text-pink-700 text-center -mt-12 mb-6">
          Product Preview
        </h1>

        <div className="flex gap-8">
          <div className="flex-1 space-y-3">
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> RM {product.price}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Seller Name:</strong> {product.user.name}</p>
            <p><strong>Seller Email:</strong> {product.user.email}</p>
            <p><strong>Created At:</strong> {product.created_at}</p>
          </div>
          {product.image && (
            <img
              src={product.image}
              alt="Product"
              className="w-60 h-60 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleApprove(product.id)}
          >
            Approve
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleRejectClick}
          >
            Reject
          </Button>
        </div>
      </div>
      <ReasonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitReason}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        />


    </>
  );
}
