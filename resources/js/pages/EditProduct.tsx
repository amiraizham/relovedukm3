import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Header from '@/components/header/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';


export default function EditProduct() {
  const { product } = usePage<PageProps<{ product: any }>>().props;


  const { data, setData, put, processing, errors } = useForm<{
    product_name: string;
    product_price: number;
    product_desc: string;
    product_category: string;
    product_img: File | null;
  }>({
    product_name: product.product_name,
    product_price: product.product_price,
    product_desc: product.product_desc,
    product_category: product.product_category,
    product_img: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData('product_img', file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('_method', 'put'); // Laravel expects _method for PUT
    formData.append('product_name', data.product_name ?? '');
    formData.append('product_desc', data.product_desc ?? '');
    formData.append('product_price', data.product_price?.toString() ?? '0');
    formData.append('product_category', data.product_category ?? '');
  
    if (data.product_img) {
      formData.append('product_img', data.product_img);
    }
  
    router.post(route('products.update', product.product_id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Product updated successfully!');
      },
      onError: (err) => {
        toast.error('Failed to update. Please check the form.');
      },
    });
  };
  

  return (
    <>
      <Header />
      <Card className="max-w-xl mx-auto p-6 mt-10">
        <h1 className="text-3xl font-bold mb-6">Edit Your Product</h1>

        <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
          {/* Product Name */}
          <div>
            <Label htmlFor="product_name">Product Name</Label>
            <Input
              id="product_name"
              value={data.product_name}
              onChange={(e) => setData('product_name', e.target.value)}
              placeholder="Enter product name"
            />
            {errors.product_name && <p className="text-red-600 text-sm">{errors.product_name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="product_desc">Description</Label>
            <Textarea
              id="product_desc"
              rows={4}
              value={data.product_desc}
              onChange={(e) => setData('product_desc', e.target.value)}
              placeholder="Enter product description"
            />
            {errors.product_desc && <p className="text-red-600 text-sm">{errors.product_desc}</p>}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="product_price">Price (RM)</Label>
            <Input
              id="product_price"
              type="number"
              value={data.product_price}
              onChange={(e) => setData('product_price', Number(e.target.value))}
              placeholder="Enter price"
              min={0}
            />
            {errors.product_price && <p className="text-red-600 text-sm">{errors.product_price}</p>}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="product_category">Category</Label>
            <Select
              value={data.product_category}
              onValueChange={(value) => setData('product_category', value)}
            >
              <SelectTrigger id="product_category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clothes">Clothes</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="makeup">Makeup</SelectItem>
              </SelectContent>
            </Select>
            {errors.product_category && <p className="text-red-600 text-sm">{errors.product_category}</p>}
          </div>

          {/* Product Image Upload */}
          <div>
            <Label htmlFor="product_img">Change Product Image</Label>
            <Input
              id="product_img"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {errors.product_img && <p className="text-red-600 text-sm">{errors.product_img}</p>}
            {product.product_img && (
              <img
                src={product.product_img}
                alt="Current Product"
                className="mt-4 w-40 h-40 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={processing}
            className={`w-full font-semibold text-white py-2 px-4 rounded-lg transition-all duration-300 ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {processing ? 'Updating...' : 'Update Product'}
          </Button>
        </form>
      </Card>
    </>
  );
}
